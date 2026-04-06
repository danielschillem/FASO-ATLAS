class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'http://localhost:8080/api/v1';

  // Auth
  static const String register     = '/auth/register';
  static const String login        = '/auth/login';
  static const String me           = '/auth/me';

  // Map
  static const String mapPlaces    = '/map/places';
  static const String mapRegions   = '/map/regions';

  // Destinations
  static const String destinations = '/destinations';

  // Establishments
  static const String establishments = '/establishments';

  // Itineraries
  static const String itineraries  = '/itineraries';

  // Reservations
  static const String reservations = '/reservations';

  // Atlas
  static const String atlasEvents  = '/atlas/events';

  // Wiki
  static const String wikiArticles = '/wiki/articles';

  // Symbols
  static const String symbols      = '/symbols';

  // Search
  static const String search       = '/search';
}
