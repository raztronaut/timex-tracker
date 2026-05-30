import { Dashboard } from "@/components/Dashboard";
import { queryListings } from "@/lib/listings";
import { getSyncStatus } from "@/lib/sync-status";

const DEFAULT_FILTER = "candidates";
const DEFAULT_SORT = "interest_score";

export default async function Home() {
  const [listingsResult, syncStatus] = await Promise.all([
    queryListings({
      filter: DEFAULT_FILTER,
      sort: DEFAULT_SORT,
      limit: 100,
      offset: 0,
    }),
    getSyncStatus(),
  ]);

  return (
    <main className="flex-1">
      <Dashboard
        initialListings={listingsResult.listings}
        initialTotal={listingsResult.total}
        initialSyncStatus={syncStatus}
      />
    </main>
  );
}
