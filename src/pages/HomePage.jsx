import React, { useEffect, useState, useCallback } from "react";
import "./HomePage.scss"; // Import SCSS file
import debounce from "lodash/debounce"; // Import lodash debounce

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState("one-piece");
  const [filmData, setFilmData] = useState(null);
  const [latestFilms, setLatestFilms] = useState([]);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Gọi API phim theo slug
  useEffect(() => {
    if (!slug) return;

    const fetchFilm = async () => {
      try {
        const res = await fetch(`https://ophim1.com/phim/${slug}`);
        const json = await res.json();
        setFilmData(json);
      } catch (err) {
        console.error("Lỗi khi gọi API phim theo slug:", err);
        setFilmData(null);
      }
    };

    fetchFilm();
  }, [slug]);

  // Gọi API phim mới cập nhật
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
        const json = await res.json();
        setLatestFilms(json.items || []);
      } catch (err) {
        console.error("Lỗi khi lấy phim mới cập nhật:", err);
      }
    };

    fetchLatest();
  }, [page]);

  // Gọi API tìm kiếm gợi ý (debounced)
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        // Hypothetical search endpoint
        const res = await fetch(`https://ophim1.com/tim-kiem?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        // Assuming API returns an array of films in json.items
        setSuggestions(json.items || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Lỗi khi lấy gợi ý tìm kiếm:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  // Xử lý chọn gợi ý
  const handleSelectSuggestion = (filmSlug) => {
    setSlug(filmSlug);
    setQuery(""); // Clear query after selection
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-input-wrapper")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="home-page">
     

      {/* Main Content */}
      <main className="container main">
        {/* Search Section */}
        <section className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={query}
              onChange={handleInputChange}
              className="search-input"
              onFocus={() => query && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((film) => (
                  <li
                    key={film._id}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(film.slug)}
                  >
                    <span className="suggestion-title">{film.name}</span>
                    <span className="suggestion-slug">({film.slug})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="search-result">
            {filmData ? (
              <div className="card-container noselect">
                <div className="canvas">
                  {[...Array(25)].map((_, i) => (
                    <div key={`tr-${i + 1}`} className={`tracker tr-${i + 1}`}></div>
                  ))}
                  <div id="card" className="card--search">
                    
                    <div className="title">{filmData?.movie?.name}</div>
                    <div className="subtitle">
                      Tên gốc: {filmData?.movie?.origin_name}
                      <br />
                      Năm: {filmData?.movie?.year}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-result">Đang tải hoặc không tìm thấy phim...</p>
            )}
          </div>
        </section>

        {/* Latest Films Section */}
        <section className="latest-films">
          <div className="latest-films__header">
            <h2 className="latest-films__title">📺 Phim mới cập nhật (Trang {page})</h2>
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="pagination__button"
                disabled={page === 1}
              >
                ⬅️ Trang trước
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="pagination__button"
              >
                Trang sau ➡️
              </button>
            </div>
          </div>
          <div className="film-grid">
            {latestFilms.length > 0 ? (
              latestFilms.map((film) => (
                <div key={film._id} className="card-container noselect">
                  <div className="canvas">
                    {[...Array(25)].map((_, i) => (
                      <div key={`tr-${i + 1}`} className={`tracker tr-${i + 1}`}></div>
                    ))}
                    <div id="card">
                  
                      <div className="title">{film.name}</div>
                      <div className="subtitle">
                        Năm: {film.year}
                        <br />
                        {film.slug}
                        <br />
                        <button
                          onClick={() => handleSelectSuggestion(film.slug)}
                          className="card-button"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-result no-result--grid">Không có phim nào để hiển thị.</p>
            )}
          </div>
        </section>
      </main>
 
  
    </div>
  );
};

export default HomePage;