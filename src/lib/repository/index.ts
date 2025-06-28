// Repository layer exports
export { waterSystemsRepo, type WaterSystem, type WaterSystemSearchResult, type WaterSystemStats, type SearchFilters } from './water-systems'
export { violationsRepo, type Violation, type ViolationStats, type ViolationFilters } from './violations'
export { analyticsRepo, type ComplianceTrend, type AnalyticsFilters } from './analytics'

// Re-export repository classes for advanced usage
export { WaterSystemsRepository } from './water-systems'
export { ViolationsRepository } from './violations'
export { AnalyticsRepository } from './analytics' 