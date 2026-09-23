import type { DemandRequest, SupplyListing, Match, MatchFactor } from '../types';
import { supplyService } from './supplyService';
import { auditService } from './auditService';
import { storageService, STORE_KEYS } from './storageService';

function computeMatch(demand: DemandRequest, listing: SupplyListing): Match | null {
  const factors: MatchFactor[] = [];
  let score = 0;

  // Commodity match — mandatory
  const commodityMatch = demand.commodity === listing.commodity;
  factors.push({
    label: 'Commodity',
    matched: commodityMatch,
    detail: commodityMatch
      ? `${demand.commodity} matches ${listing.commodity}`
      : `Requested ${demand.commodity}, available ${listing.commodity}`,
  });
  if (!commodityMatch) return null; // hard filter
  score += 40;

  // Quantity available
  const quantityOk = listing.quantity >= demand.quantity;
  factors.push({
    label: 'Quantity available',
    matched: quantityOk,
    detail: quantityOk
      ? `${listing.quantity} ${listing.unit} available, ${demand.quantity} ${demand.unit} requested`
      : `Only ${listing.quantity} ${listing.unit} available`,
  });
  if (quantityOk) score += 20;

  // Quality grade
  const gradeOk = listing.qualityGrade === demand.qualityGrade || listing.qualityGrade === 'A';
  factors.push({
    label: 'Quality grade',
    matched: gradeOk,
    detail: gradeOk
      ? `Grade ${listing.qualityGrade} meets Grade ${demand.qualityGrade} requirement`
      : `Grade mismatch`,
  });
  if (gradeOk) score += 15;

  // Availability date compatible
  const availDate = new Date(listing.availabilityDate);
  const requiredDate = new Date(demand.requiredByDate);
  const dateOk = availDate <= requiredDate;
  factors.push({
    label: 'Availability date',
    matched: dateOk,
    detail: dateOk
      ? `Available ${new Date(listing.availabilityDate).toLocaleDateString()}, required by ${new Date(demand.requiredByDate).toLocaleDateString()}`
      : `Not available until after required date`,
  });
  if (dateOk) score += 15;

  // Rough location compatibility (same country for now)
  const originCountry = listing.location.split(',').pop()?.trim().toLowerCase() ?? '';
  const destCountry = demand.destinationLocation.split(',').pop()?.trim().toLowerCase() ?? '';
  const locationOk = originCountry === destCountry || originCountry.includes('nigeria') || destCountry.includes('nigeria');
  factors.push({
    label: 'Destination serviceable',
    matched: locationOk,
    detail: locationOk
      ? `${listing.location} → ${demand.destinationLocation}`
      : `Locations may be incompatible`,
  });
  if (locationOk) score += 10;

  return {
    id: `MATCH-${demand.id}-${listing.id}`,
    demandId: demand.id,
    listingId: listing.id,
    buyerId: demand.buyerId,
    supplierId: listing.supplierId,
    score,
    factors,
    createdAt: new Date().toISOString(),
  };
}

export const matchingService = {
  async findMatchesForDemand(demand: DemandRequest): Promise<Match[]> {
    await delay(800);
    const activeListings = await supplyService.getActive();
    const matches: Match[] = [];
    for (const listing of activeListings) {
      if (listing.supplierId === demand.buyerId) continue; // can't buy from yourself
      const match = computeMatch(demand, listing);
      if (match && match.score >= 30) {
        matches.push(match);
      }
    }
    matches.sort((a, b) => b.score - a.score);

    // Persist matches
    const existing = storageService.get<Match[]>(STORE_KEYS.MATCHES) ?? [];
    const toAdd = matches.filter((m) => !existing.find((e) => e.id === m.id));
    storageService.set(STORE_KEYS.MATCHES, [...existing, ...toAdd]);

    if (matches.length > 0) {
      auditService.log({
        action: 'match_generated',
        actorId: 'system',
        actorName: 'AgriFlow System',
        actorRole: 'system',
        entityId: demand.id,
        entityType: 'Match',
        detail: `${matches.length} match(es) generated for demand ${demand.id}.`,
      });
    }

    return matches;
  },

  getMatchesForListing(listingId: string): Match[] {
    const all = storageService.get<Match[]>(STORE_KEYS.MATCHES) ?? [];
    return all.filter((m) => m.listingId === listingId);
  },

  // Returns best match score for a listing given a demand
  getMatchForPair(demandId: string, listingId: string): Match | null {
    const all = storageService.get<Match[]>(STORE_KEYS.MATCHES) ?? [];
    return all.find((m) => m.demandId === demandId && m.listingId === listingId) ?? null;
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
