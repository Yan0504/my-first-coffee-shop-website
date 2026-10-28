import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Car,
  Check,
  ExternalLink,
  Footprints,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  TrainFront,
  X,
} from 'lucide-react';
import { LiveStorePlace } from '../types/coffee';

interface StoreLocatorSectionProps {
  selectedPickupStore: LiveStorePlace | null;
  onStoresLoaded: (stores: LiveStorePlace[]) => void;
  onSelectPickupStore: (store: LiveStorePlace) => void;
}

type TravelModeOption = 'WALKING' | 'DRIVING' | 'TRANSIT';

interface RouteSummary {
  distanceMeters: number;
  durationMillis: number;
}

const REGION_PRESETS = [
  { id: 'taipei-daan', label: '台北大安・信義', query: '精品咖啡 自家烘焙 台北市大安區' },
  { id: 'taipei-zhongshan', label: '台北中山・赤峰', query: '精品手沖咖啡 台北市中山區' },
  { id: 'taichung-west', label: '台中西區・草悟道', query: '自家烘焙精品咖啡 台中市西區' },
  { id: 'tainan-central', label: '台南中西區', query: '精品手沖咖啡焙煎 台南市中西區' },
];

const INITIAL_MAP_CENTER = { lat: 25.0329, lng: 121.5434 };

function checkAndDispatchQuotaError(err: unknown) {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  if (
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('QuotaExceeded') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('429')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

function extractLatLng(
  loc: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
): { lat: number; lng: number } | null {
  if (!loc) return null;
  const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
  const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }
  return null;
}

interface StoreMarkerProps {
  store: LiveStorePlace;
  isSelected: boolean;
  isPickupStore: boolean;
  onSelect: (store: LiveStorePlace) => void;
  onSetPickup: (store: LiveStorePlace) => void;
}

const StoreMarkerItem: React.FC<StoreMarkerProps> = ({
  store,
  isSelected,
  isPickupStore,
  onSelect,
  onSetPickup,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={store.location}
        title={store.name}
        onClick={() => onSelect(store)}
      >
        <Pin
          background={isSelected ? '#1F4E3D' : '#27272A'}
          borderColor={isSelected ? '#0F291E' : '#18181B'}
          glyphColor="#FAF9F7"
          scale={isSelected ? 1.25 : 1.05}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={280}
          onCloseClick={() => onSelect(store)}
        >
          <div className="p-1 text-zinc-900 space-y-2">
            <p className="text-sm font-semibold leading-snug">{store.name}</p>
            <p className="text-xs text-zinc-600 leading-relaxed">{store.address}</p>
            {typeof store.rating === 'number' && (
              <p className="text-xs text-zinc-600 tabular-nums">
                評分 {store.rating.toFixed(1)}（{store.userRatingCount || 0} 則評論）
              </p>
            )}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSetPickup(store)}
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPickupStore ? '目前已選自取店' : '設為自取據點'}
              </button>
              {store.googleMapsURI && (
                <a
                  href={store.googleMapsURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap"
                >
                  <span>地圖開啟</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface InteractiveStoreExplorerProps {
  selectedPickupStore: LiveStorePlace | null;
  onStoresLoaded: (stores: LiveStorePlace[]) => void;
  onSelectPickupStore: (store: LiveStorePlace) => void;
}

const InteractiveStoreExplorer: React.FC<InteractiveStoreExplorerProps> = ({
  selectedPickupStore,
  onStoresLoaded,
  onSelectPickupStore,
}) => {
  const map = useMap();
  const apiStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');
  const coreLib = useMapsLibrary('core');

  const [activePresetId, setActivePresetId] = useState<string>(REGION_PRESETS[0].id);
  const [customSearchText, setCustomSearchText] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState(REGION_PRESETS[0].query);

  const [stores, setStores] = useState<LiveStorePlace[]>([]);
  const [activeStore, setActiveStore] = useState<LiveStorePlace | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Origin Autocomplete & Geolocation for Route Calculation
  const [originInput, setOriginInput] = useState('');
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(
    null
  );

  const [travelMode, setTravelMode] = useState<TravelModeOption>('WALKING');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // 1. Live Place.searchByText (Places API New) — Zero LLM-hallucinated place data
  useEffect(() => {
    if (!placesLib || !activeSearchQuery) return;

    let cancelled = false;
    setPlacesLoading(true);
    setPlacesError(null);

    const runTextSearch = async () => {
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: activeSearchQuery,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'nationalPhoneNumber',
            'googleMapsURI',
            'regularOpeningHours',
            'businessStatus',
          ],
          includedType: 'cafe',
          language: 'zh-TW',
          region: 'tw',
          maxResultCount: 5,
        });

        if (cancelled) return;

        const mapped: LiveStorePlace[] = (places || [])
          .map((p) => {
            const coords = extractLatLng(p.location);
            if (!coords) return null;
            const rawDisplayName = p.displayName as unknown;
            const resolvedName =
              typeof rawDisplayName === 'string'
                ? rawDisplayName
                : (rawDisplayName as { text?: string } | null)?.text || '精品咖啡門市';

            return {
              id: p.id || `${coords.lat}-${coords.lng}`,
              name: resolvedName,
              address: p.formattedAddress || '',
              location: coords,
              rating: typeof p.rating === 'number' ? p.rating : undefined,
              userRatingCount:
                typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
              phoneNumber: p.nationalPhoneNumber || undefined,
              googleMapsURI: p.googleMapsURI || undefined,
              weekdayHours: p.regularOpeningHours?.weekdayDescriptions || undefined,
            } as LiveStorePlace;
          })
          .filter((item): item is LiveStorePlace => item !== null);

        setStores(mapped);
        onStoresLoaded(mapped);

        if (mapped.length > 0) {
          setActiveStore(mapped[0]);
          if (map && coreLib) {
            const bounds = new coreLib.LatLngBounds();
            mapped.forEach((s) => bounds.extend(s.location));
            map.fitBounds(bounds, 64);
          } else if (map) {
            map.panTo(mapped[0].location);
            map.setZoom(14);
          }
        } else {
          setActiveStore(null);
        }
      } catch (err) {
        if (cancelled) return;
        checkAndDispatchQuotaError(err);
        setPlacesError('目前無法載入區域門市地標資訊，請稍後再試。');
      } finally {
        if (!cancelled) {
          setPlacesLoading(false);
        }
      }
    };

    void runTextSearch();

    return () => {
      cancelled = true;
    };
  }, [placesLib, coreLib, map, activeSearchQuery, onStoresLoaded]);

  // 2. Origin Autocomplete Suggestions (Places API New + Session Token)
  useEffect(() => {
    if (!placesLib) return;
    const trimmed = originInput.trim();
    if (trimmed.length < 2 || trimmed === originLabel) {
      setSuggestions([]);
      return;
    }

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: trimmed,
        language: 'zh-TW',
        region: 'tw',
        sessionToken: sessionTokenRef.current || undefined,
      })
        .then((res) => {
          if (!cancelled) {
            setSuggestions(res?.suggestions || []);
          }
        })
        .catch((err) => {
          checkAndDispatchQuotaError(err);
          if (!cancelled) setSuggestions([]);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [placesLib, originInput, originLabel]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });
        const coords = extractLatLng(place.location);
        const label =
          suggestion.placePrediction.text?.text ||
          place.formattedAddress ||
          '已選起點';
        if (coords) {
          setOriginCoords(coords);
          setOriginLabel(label);
          setOriginInput(label);
        }
        // Reset session token after fetchFields consumes the session
        sessionTokenRef.current = null;
        setSuggestions([]);
      } catch (err) {
        checkAndDispatchQuotaError(err);
      }
    },
    [placesLib]
  );

  // Explicit, revocable user geolocation consent
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRouteError('您的瀏覽器不支援地理定位功能，請直接輸入出發地點。');
      return;
    }
    setRouteError(null);
    setRouteLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setOriginCoords(coords);
        setOriginLabel('目前所在裝置定位');
        setOriginInput('目前所在裝置定位');
        setSuggestions([]);
        setRouteLoading(false);
      },
      () => {
        setRouteLoading(false);
        setRouteError('無法取得裝置位置權限，您可於上方搜尋框輸入捷運站或地標作為起點。');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleClearOrigin = () => {
    setOriginCoords(null);
    setOriginLabel(null);
    setOriginInput('');
    setSuggestions([]);
    setRouteSummary(null);
    setRouteError(null);
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  };

  // 3. Modern Route Calculation via Routes API (`Route.computeRoutes`)
  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!routesLib || !map || !originCoords || !activeStore) {
      setRouteSummary(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(null);

    const routeClass = (
      routesLib as unknown as {
        Route?: {
          computeRoutes: (req: Record<string, unknown>) => Promise<{
            routes?: Array<{
              distanceMeters?: number;
              durationMillis?: number;
              viewport?: google.maps.LatLngBounds;
              createPolylines: () => google.maps.Polyline[];
            }>;
          }>;
        };
      }
    ).Route;

    if (!routeClass || typeof routeClass.computeRoutes !== 'function') {
      setRouteLoading(false);
      setRouteError('路線規劃服務載入中，請稍候重試。');
      return;
    }

    routeClass
      .computeRoutes({
        origin: originCoords,
        destination: activeStore.location,
        travelMode,
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      })
      .then((res) => {
        if (cancelled) return;
        setRouteLoading(false);
        const primaryRoute = res?.routes?.[0];
        if (!primaryRoute) {
          setRouteSummary(null);
          setRouteError('查無此交通方式的可行路線，請嘗試切換步行或開車模式。');
          return;
        }

        const newPolylines = primaryRoute.createPolylines();
        newPolylines.forEach((poly) => {
          poly.setOptions({
            strokeColor: '#1F4E3D',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });
          poly.setMap(map);
        });
        polylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 56);
        }

        setRouteSummary({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setRouteLoading(false);
        checkAndDispatchQuotaError(err);
        setRouteError('無法計算路線資訊，請確認起點位置或稍後重試。');
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, originCoords, activeStore, travelMode]);

  const handleSelectStoreCard = (store: LiveStorePlace) => {
    setActiveStore(store);
    if (map && !originCoords) {
      map.panTo(store.location);
      map.setZoom(16);
    }
  };

  const handlePresetClick = (preset: (typeof REGION_PRESETS)[number]) => {
    setActivePresetId(preset.id);
    setCustomSearchText('');
    setActiveSearchQuery(preset.query);
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchText.trim()) return;
    setActivePresetId('custom');
    setActiveSearchQuery(`精品咖啡 ${customSearchText.trim()}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Region Tabs + Neighborhood Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div
          role="group"
          aria-label="選擇門市與合作烘豆體驗區域"
          className="inline-flex items-center gap-1 p-1 bg-[#EAE8E3] rounded-lg overflow-x-auto max-w-full"
        >
          {REGION_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleCustomSearchSubmit}
          className="flex items-center gap-2 w-full lg:w-80"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={customSearchText}
              onChange={(e) => setCustomSearchText(e.target.value)}
              placeholder="搜尋其他縣市或商圈據點..."
              aria-label="搜尋其他縣市或商圈咖啡據點"
              className="w-full pl-9 pr-3 py-2 min-h-[40px] text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1F4E3D]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            搜尋據點
          </button>
        </form>
      </div>

      {/* Main 2-Column Split: Left Store List & Route Planner | Right Interactive Google Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Route & ETA Calculator Box */}
          <div className="bg-[#FAF9F7] border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#1F4E3D]" />
                <span>即時路線與預估抵達時間規劃</span>
              </h3>
              {originCoords && (
                <button
                  type="button"
                  onClick={handleClearOrigin}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>清除定位起點</span>
                </button>
              )}
            </div>

            {/* Origin Autocomplete Input */}
            <div className="relative">
              <input
                type="text"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  if (originLabel) setOriginLabel(null);
                }}
                placeholder="輸入出發地標（例如：台北車站、大安捷運站）"
                aria-label="輸入出發地點搜尋路線"
                className="w-full px-3.5 py-2.5 min-h-[40px] text-xs sm:text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1F4E3D]"
              />

              {suggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-zinc-200 rounded-lg shadow-lg divide-y divide-zinc-100 max-h-52 overflow-y-auto"
                >
                  {suggestions.map((sug, idx) => (
                    <li key={sug.placePrediction?.placeId || idx}>
                      <button
                        type="button"
                        onClick={() => void handleSelectSuggestion(sug)}
                        className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-zinc-800 hover:bg-[#FAF9F7] transition-colors cursor-pointer"
                      >
                        {sug.placePrediction?.text?.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Geolocation Button & Travel Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LocateFixed className="w-3.5 h-3.5 text-[#1F4E3D]" />
                <span>使用目前定位</span>
              </button>

              <div
                role="group"
                aria-label="交通方式"
                className="inline-flex items-center gap-1 p-0.5 bg-zinc-200/70 rounded-lg"
              >
                {(
                  [
                    { mode: 'WALKING', label: '步行', Icon: Footprints },
                    { mode: 'DRIVING', label: '開車', Icon: Car },
                    { mode: 'TRANSIT', label: '大眾運輸', Icon: TrainFront },
                  ] as const
                ).map(({ mode, label, Icon }) => {
                  const selected = travelMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTravelMode(mode)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selected
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Route Calculation Feedback */}
            {routeLoading && (
              <p className="text-xs text-zinc-500">正在計算前往門市的路線與距離...</p>
            )}
            {routeError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {routeError}
              </p>
            )}
            {routeSummary && activeStore && !routeLoading && (
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-2 text-xs sm:text-sm tabular-nums">
                <span className="text-zinc-600 truncate">
                  前往 <strong className="text-zinc-900">{activeStore.name}</strong>
                </span>
                <span className="font-mono font-semibold text-[#1F4E3D] whitespace-nowrap shrink-0">
                  {(routeSummary.distanceMeters / 1000).toFixed(1)} km · 約{' '}
                  {Math.max(1, Math.round(routeSummary.durationMillis / 60000))} 分鐘
                </span>
              </div>
            )}
          </div>

          {/* Live Google Places Store List */}
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {placesLoading ? (
              <div className="p-8 text-center bg-[#FAF9F7] border border-zinc-200 rounded-xl text-sm text-zinc-500">
                正在透過 Google Maps 載入即時門市與營業資訊...
              </div>
            ) : placesError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800">
                {placesError}
              </div>
            ) : stores.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9F7] border border-zinc-200 rounded-xl text-sm text-zinc-600">
                此區域目前查無相符咖啡據點，請切換上方區域或輸入其他商圈關鍵字。
              </div>
            ) : (
              stores.map((store) => {
                const isSelected = activeStore?.id === store.id;
                const isPickup = selectedPickupStore?.id === store.id;
                const todayIndex = (new Date().getDay() + 6) % 7;
                const todayHours = store.weekdayHours?.[todayIndex];

                return (
                  <div
                    key={store.id}
                    onClick={() => handleSelectStoreCard(store)}
                    className={`rounded-xl border p-4 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF9F7] border-[#1F4E3D] ring-1 ring-[#1F4E3D]'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm sm:text-base font-semibold text-zinc-900">
                        {store.name}
                      </h4>
                      {typeof store.rating === 'number' && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-zinc-700 tabular-nums whitespace-nowrap shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {store.rating.toFixed(1)} ({store.userRatingCount || 0})
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-zinc-600 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>

                    {store.phoneNumber && (
                      <p className="mt-1 text-xs text-zinc-600 flex items-center gap-1.5 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{store.phoneNumber}</span>
                      </p>
                    )}

                    {todayHours && (
                      <p className="mt-1 text-xs text-zinc-500">
                        今日營業：{todayHours}
                      </p>
                    )}

                    <div className="mt-3.5 pt-3 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPickupStore(store);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isPickup
                            ? 'bg-[#1F4E3D] text-white'
                            : 'bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        {isPickup && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{isPickup ? '已設為線上自取店' : '選為自取取餐店'}</span>
                      </button>

                      {store.googleMapsURI && (
                        <a
                          href={store.googleMapsURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#1F4E3D] hover:underline whitespace-nowrap"
                        >
                          <span>Google 地圖檢視</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Interactive Google Map */}
        <div className="lg:col-span-7">
          <div className="gmp-map-shell relative w-full h-[460px] lg:h-[600px] rounded-xl overflow-hidden border border-zinc-200 bg-[#EFECE6]">
            {apiStatus === APILoadingStatus.AUTH_FAILURE ||
            apiStatus === APILoadingStatus.FAILED ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                <MapPin className="w-8 h-8 text-zinc-400 mb-2" />
                <p className="text-sm font-semibold text-zinc-900">
                  互動地圖暫時無法載入
                </p>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                  請確認網路連線或 Google Maps API 金鑰權限設定。
                </p>
              </div>
            ) : (
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={INITIAL_MAP_CENTER}
                defaultZoom={13}
                gestureHandling="cooperative"
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {/* Origin Marker if user selected a route origin */}
                {originCoords && (
                  <AdvancedMarker position={originCoords} title="您的出發起點">
                    <Pin
                      background="#D97706"
                      borderColor="#92400E"
                      glyphColor="#FFFFFF"
                      scale={1.0}
                    />
                  </AdvancedMarker>
                )}

                {/* Store Markers from Live Places API */}
                {stores.map((store) => (
                  <StoreMarkerItem
                    key={store.id}
                    store={store}
                    isSelected={activeStore?.id === store.id}
                    isPickupStore={selectedPickupStore?.id === store.id}
                    onSelect={handleSelectStoreCard}
                    onSetPickup={onSelectPickupStore}
                  />
                ))}
              </Map>
            )}
          </div>

          <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
            地圖地標、營業時段與路線預估由 Google Maps Platform 即時提供。使用定位與地圖功能須遵守{' '}
            <a
              href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-800"
            >
              Google Maps 額外服務條款
            </a>{' '}
            與{' '}
            <a
              href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-800"
            >
              Google 隱私權政策
            </a>
            。
          </p>
        </div>
      </div>
    </div>
  );
};

export const StoreLocatorSection: React.FC<StoreLocatorSectionProps> = ({
  selectedPickupStore,
  onStoresLoaded,
  onSelectPickupStore,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <section
      id="locations"
      className="border-t border-zinc-200/80 bg-white py-16 lg:py-24"
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-500 mb-2">
            店家地理位置與路線導覽 · 支援即時步行／行車／大眾運輸時間試算與自取門市綁定
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 tracking-tight text-balance">
            門市據點與互動路線地圖
          </h2>
        </div>

        <APIProvider apiKey={apiKey} language="zh-TW" region="TW">
          <InteractiveStoreExplorer
            selectedPickupStore={selectedPickupStore}
            onStoresLoaded={onStoresLoaded}
            onSelectPickupStore={onSelectPickupStore}
          />
        </APIProvider>
      </div>
    </section>
  );
};
