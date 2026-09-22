import { test, expect } from '@playwright/test';
import { registerViaApi, loginViaUI, logoutViaUI, getStoredToken, apiGet, uniqueSuffix, type TestUser } from './helpers';

// One continuous flow, one browser context throughout (deliberately not
// split into separate `test()`s): the hybrid localStorage data (payments,
// logistics jobs) lives in this one browser's storage and needs to stay
// visible across every role switch, exactly like the app's own
// single-browser demo model (see LoginPage's "Quick Account Fill").
test('buyer-supplier-logistics-admin trade lifecycle', async ({ page, request }) => {
  const suffix = uniqueSuffix();
  const password = 'testpass123';

  const buyer: TestUser = { name: `E2E Buyer ${suffix}`, email: `buyer-${suffix}@e2e.agriflow`, password, role: 'buyer' };
  const supplier: TestUser = { name: `E2E Supplier ${suffix}`, email: `supplier-${suffix}@e2e.agriflow`, password, role: 'supplier' };
  const logistics: TestUser = { name: `E2E Logistics ${suffix}`, email: `logistics-${suffix}@e2e.agriflow`, password, role: 'logistics' };
  const admin: TestUser = { name: `E2E Admin ${suffix}`, email: `admin-${suffix}@e2e.agriflow`, password, role: 'admin' };

  const buyerReg = await registerViaApi(request, buyer);
  const supplierReg = await registerViaApi(request, supplier);
  const logisticsReg = await registerViaApi(request, logistics);
  // Admin is deliberately not registerable through the UI (RegisterPage
  // offers no admin option) — registered directly against the API, which
  // is itself the known risk this project flags: nothing stops anyone
  // hitting /auth/register with role=admin directly.
  const adminReg = await registerViaApi(request, admin);

  let listingId = '';
  let demandId = '';
  let txnId = '';
  let jobId = '';

  await test.step('supplier creates a listing', async () => {
    await loginViaUI(page, supplier.email, supplier.password);
    await page.goto('/app/supply/new');
    await page.getByLabel('Commodity').selectOption('maize');
    await page.getByLabel('Quality Grade').selectOption('A');
    await page.getByLabel('Quantity').fill('20');
    await page.getByLabel('Unit', { exact: true }).selectOption('tonnes');
    await page.getByLabel('Price per Unit (₦)').fill('480000');
    await page.getByLabel('Location / Origin').fill('Ogbomoso, Oyo State');
    await page.getByLabel('Availability Date').fill('2026-09-25');
    await page.getByLabel('Description').fill(`E2E test listing ${suffix}`);
    await page.getByRole('button', { name: 'Publish Listing' }).click();
    await page.waitForURL('**/app/supply/manage');

    const listings = await apiGet(request, '/listings/mine', supplierReg.token);
    const created = listings.find((l: { description: string }) => l.description === `E2E test listing ${suffix}`);
    expect(created).toBeTruthy();
    listingId = created.id;
    // .first(): the same id also briefly appears in the "published" toast.
    await expect(page.getByText(listingId).first()).toBeVisible();
  });

  await test.step("listing appears in the buyer's supply list", async () => {
    await logoutViaUI(page);
    await loginViaUI(page, buyer.email, buyer.password);
    await page.goto('/app/supply');
    await expect(page.getByText(`${supplier.name}`)).toBeVisible();
  });

  await test.step('buyer creates a demand', async () => {
    await page.goto('/app/demands/new');
    await page.getByRole('button', { name: 'Review demand' }).click();
    await page.getByRole('button', { name: 'Submit & Find Matches' }).click();
    await page.waitForURL('**/app/matches/**', { timeout: 15_000 });

    const demands = await apiGet(request, '/demands/mine', buyerReg.token);
    expect(demands.length).toBeGreaterThan(0);
    demandId = demands[0].id;

    await page.goto('/app/demands');
    await expect(page.getByText(demandId)).toBeVisible();
  });

  await test.step('buyer starts a transaction against the listing', async () => {
    await page.goto(`/app/supply/${listingId}`);
    await page.getByRole('button', { name: 'Start Transaction' }).click();
    await page.getByLabel('Quantity').fill('5');
    await page.getByLabel('Delivery Location').fill('Ikeja, Lagos');
    await page.getByLabel('Required Delivery Date').fill('2026-10-15');
    await page.getByRole('button', { name: 'Initiate Transaction' }).click();
    await page.waitForURL('**/app/transactions/*');
    txnId = page.url().split('/').pop()!;
    expect(txnId).toMatch(/^TXN-/);

    const txn = await apiGet(request, `/transactions/${txnId}`, buyerReg.token);
    expect(txn.status).toBe('PENDING');
  });

  await test.step('supplier accepts the transaction', async () => {
    await logoutViaUI(page);
    await loginViaUI(page, supplier.email, supplier.password);
    await page.goto(`/app/transactions/${txnId}`);
    await page.getByRole('button', { name: 'Accept Transaction' }).click();
    // .first(): the status pill in the header, not the same label in the
    // "Transaction Progress" pipeline steps below it.
    await expect(page.getByText('Accepted', { exact: true }).first()).toBeVisible();

    const txn = await apiGet(request, `/transactions/${txnId}`, supplierReg.token);
    expect(txn.status).toBe('ACCEPTED');
  });

  await test.step('buyer completes escrow payment', async () => {
    await logoutViaUI(page);
    await loginViaUI(page, buyer.email, buyer.password);
    await page.goto(`/app/transactions/${txnId}`);
    await page.getByRole('button', { name: /^Pay/ }).click();
    await page.getByRole('button', { name: /Confirm Payment/ }).click();
    await expect(page.getByText('Payment confirmed', { exact: false })).toBeVisible({ timeout: 10_000 });

    const jobs: { transactionId: string; id: string }[] = await page.evaluate(
      () => JSON.parse(localStorage.getItem('agriflow_logistics_jobs') || '[]')
    );
    const job = jobs.find((j) => j.transactionId === txnId);
    expect(job).toBeTruthy();
    jobId = job!.id;

    const txn = await apiGet(request, `/transactions/${txnId}`, buyerReg.token);
    expect(['PAYMENT_CONFIRMED', 'LOGISTICS_PENDING']).toContain(txn.status);
  });

  await test.step('admin assigns the logistics provider', async () => {
    await logoutViaUI(page);
    await loginViaUI(page, admin.email, admin.password);
    // The logistics user must have logged in on this browser at least once
    // for the admin's provider dropdown to know about them — there's no
    // backend GET /users endpoint yet (see final report). Logging out below
    // is what makes them "known" here even though they haven't acted yet.
    await logoutViaUI(page);
    await loginViaUI(page, logistics.email, logistics.password);
    await logoutViaUI(page);
    await loginViaUI(page, admin.email, admin.password);

    await page.goto('/app/admin/logistics');
    await page.getByRole('button', { name: 'Assign Provider' }).first().click();
    const modal = page.locator('.fixed.inset-0');
    await modal.getByLabel('Logistics Provider').selectOption(logisticsReg.user.id);
    await modal.getByRole('button', { name: 'Assign Provider' }).click();
    await expect(page.getByText('assigned to job', { exact: false })).toBeVisible();

    const txn = await apiGet(request, `/transactions/${txnId}`, adminReg.token);
    expect(txn.status).toBe('LOGISTICS_ASSIGNED');
  });

  await test.step('logistics moves the shipment through to delivered', async () => {
    await logoutViaUI(page);
    await loginViaUI(page, logistics.email, logistics.password);
    await page.goto(`/app/jobs/${jobId}`);

    await page.getByRole('button', { name: 'Accept Job' }).click();
    await expect(page.getByText('ACCEPTED', { exact: false }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Ready for Pickup' }).click();
    await page.getByRole('button', { name: 'Picked Up' }).click();
    await page.getByRole('button', { name: 'In Transit' }).click();

    await page.getByRole('button', { name: 'Mark Delivered' }).click();
    const modal = page.locator('.fixed.inset-0');
    await modal.getByLabel('Recipient Name').fill('E2E Test Recipient');
    await modal.getByLabel('Delivery Note').fill('Delivered in good condition — e2e test.');
    await modal.getByRole('button', { name: 'Mark Delivered' }).click();
    await expect(page.getByText('Shipment marked as delivered', { exact: false })).toBeVisible();

    // logisticsReg.token can't be used here — GET /transactions/:id is
    // buyer/supplier/admin only (see final report: logistics has no
    // backend-modeled relationship to a transaction it's servicing).
    const txn = await apiGet(request, `/transactions/${txnId}`, buyerReg.token);
    expect(txn.status).toBe('DELIVERED');
  });

  await test.step('buyer confirms receipt — transaction completes', async () => {
    await logoutViaUI(page);
    await loginViaUI(page, buyer.email, buyer.password);
    await page.goto(`/app/transactions/${txnId}`);
    await page.getByRole('button', { name: 'Confirm Delivery' }).click();
    await expect(page.getByText('Completed', { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    const txn = await apiGet(request, `/transactions/${txnId}`, buyerReg.token);
    expect(txn.status).toBe('COMPLETED');
  });

  await test.step('data survives a localStorage clear — it lives on the backend', async () => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await loginViaUI(page, buyer.email, buyer.password);

    await page.goto('/app/transactions');
    await expect(page.getByText(txnId)).toBeVisible();

    await page.goto('/app/demands');
    await expect(page.getByText(demandId)).toBeVisible();

    await logoutViaUI(page);
    await loginViaUI(page, supplier.email, supplier.password);
    await page.goto('/app/supply/manage');
    await expect(page.getByText(listingId)).toBeVisible();
  });
});

test('a user with the wrong role cannot drive a transition — UI surfaces the backend error', async ({ page, request }) => {
  const suffix = uniqueSuffix();
  const password = 'testpass123';
  const buyer: TestUser = { name: `E2E Buyer ${suffix}`, email: `buyer-${suffix}@e2e.agriflow`, password, role: 'buyer' };
  const supplier: TestUser = { name: `E2E Supplier ${suffix}`, email: `supplier-${suffix}@e2e.agriflow`, password, role: 'supplier' };
  const buyerReg = await registerViaApi(request, buyer);
  const supplierReg = await registerViaApi(request, supplier);

  const listing = await (await request.post(`${process.env.VITE_API_URL ?? 'http://localhost:8080/api'}/listings`, {
    headers: { Authorization: `Bearer ${supplierReg.token}` },
    data: { commodity: 'maize', quantity: 10, unit: 'tonnes', qualityGrade: 'A', pricePerUnit: 480000, currency: 'NGN', location: 'Test', availabilityDate: '2026-09-25T00:00:00Z', description: `wrong-role test ${suffix}` },
  })).json();

  const apiBase = process.env.VITE_API_URL ?? 'http://localhost:8080/api';
  const txn = await (await request.post(`${apiBase}/transactions`, {
    headers: { Authorization: `Bearer ${buyerReg.token}` },
    data: { listingId: listing.id, quantity: 2, deliveryLocation: 'Ikeja, Lagos', expectedDeliveryDate: '2026-10-15T00:00:00Z' },
  })).json();

  // Accept it first (a valid, supplier-only transition) so the next
  // transition (PENDING_ACCEPTED -> PAYMENT_PENDING) is structurally legal
  // and the only thing standing in the way is who's driving it.
  const accepted = await (await request.post(`${apiBase}/transactions/${txn.id}/transition`, {
    headers: { Authorization: `Bearer ${supplierReg.token}` },
    data: { to: 'ACCEPTED' },
  })).json();
  expect(accepted.status).toBe('ACCEPTED');

  // The supplier navigates straight to the payment page URL —
  // CompletePaymentPage doesn't gate the Pay button by role client-side,
  // so this is a real test of the backend rejecting an out-of-role
  // transition (ACCEPTED -> PAYMENT_PENDING requires a buyer), rather than
  // the UI just hiding the button.
  await loginViaUI(page, supplier.email, supplier.password);
  await page.goto(`/app/transactions/${txn.id}/pay`);
  await page.getByRole('button', { name: /^Pay ₦/ }).click();
  await expect(page.getByText('cannot perform this action', { exact: false })).toBeVisible({ timeout: 10_000 });

  const after = await apiGet(request, `/transactions/${txn.id}`, buyerReg.token);
  expect(after.status).toBe('ACCEPTED');
});
