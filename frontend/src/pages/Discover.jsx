import DiscoverBrowse from "../features/discover/DiscoverBrowse";
import DiscoverUsers from "../features/discover/DiscoverUsers";
import DiscoverForums from "../features/discover/DiscoverForums";
import "../styling/Discover.css";
import { useDiscover } from "../features/discover/useDiscover";

export default function Discover() {
  const { forums, searchText, setSearchText, status, filteredUsers } = useDiscover();

  return (
    <div className="discover-page">
      <div className="discover-container">
        <div className="discover-header">
          <h1 className="discover-title">
            <strong>Discover</strong>
          </h1>
          <p className="discover-subtitle">
            Explore <strong>public profiles</strong>, discover new music tastes,
            and jump into <strong>featured forums</strong>.
          </p>
        </div>

        <div className="discover-layout">
          <DiscoverBrowse />

          <DiscoverUsers filteredUsers={filteredUsers} searchText={searchText} setSearchText={setSearchText} status={status} />

          <DiscoverForums forums={forums} />
        </div>
      </div>
    </div>
  );
}
