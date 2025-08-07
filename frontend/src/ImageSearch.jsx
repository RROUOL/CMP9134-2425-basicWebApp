import React, { useState } from "react";

// Pass the user info into the ImageSearch page in order to allow for SearchHistoryPage and SearchHistory to work as intended
const ImageSearch = ({ user }) => {

    // Handles queries and other search filters
    const [query, setQuery] = useState("");
    const [mediaType, setMediaType] = useState("all");
    const [licenseType, setLicenseType] = useState("");
    const [license, setLicense] = useState("");
    const [category, setCategory] = useState("");
    const [extension, setExtension] = useState("");
    const [aspectRatio, setAspectRatio] = useState("");
    const [size, setSize] = useState("");
    const [source, setSource] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);


    const fetchMedia = async (type) => {
        // allows anonymous access to the openverse API
        const baseUrl = `https://api.openverse.org/v1/${type}/`;
        const params = new URLSearchParams({
            q: query,
            license_type: licenseType,
            license: license,
            categories: category,
            extension: extension,
            aspect_ratio: type === "images" ? aspectRatio : undefined,
            size: type === "images" ? size : undefined,
            source: source,
            page_size: 20,
            page: page
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);
        if (!response.ok) throw new Error(`This didn't work!! Status: ${response.status}`);

        const data = await response.json();
        return data.results.map(item => ({
            type,
            url: item.url,
            thumbnail: item.thumbnail,
            title: item.title || 'Untitled',
            license: item.license || '',
            licenseVersion: item.license_version || '',
            sourceUrl: item.foreign_landing_url || '#',
            creator: item.creator || 'Unknown',
            sourceSite: item.source || 'Unknown',
        }));
    };

    const handleSearch = async (e) => {
        e?.preventDefault?.();
        try {

            // abort search if not logged in
            console.log("User in ImageSearch:", user);
            if (!user?.username) {
                alert("Please log in in order to search.");
                return;
            }

            let mediaResults = [];

            if (mediaType === "all") {
                const [images, audio] = await Promise.all([
                    fetchMedia("images"),
                    fetchMedia("audio")
                ]);
                // merge both images and audio into one results page (if applicable)
                mediaResults = [...images, ...audio];
            } else {
                mediaResults = await fetchMedia(mediaType);
            }

            setResults(mediaResults);
            setError(null);

            // On a successful search, save it to SearchHistory, filed under the user's username
            await fetch("http://127.0.0.1:5000/save_search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: user.username,
                    search_query: query,
                    search_filters: {
                    mediaType,
                    licenseType,
                    license,
                    category,
                    extension,
                    aspectRatio,
                    size,
                    source
                    }
                })
            });

        } catch (err) {
            console.error("Error fetching media:", err);
            setError("But nothing could be found. Have you checked your spelling and filters? Or maybe you've been searching too much?");
            setResults([]);
        }
    };

    const goToNextPage = () => {
        setPage(prev => prev + 1);
    };

    // cannot be used on page 1
    const goToPrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    // re-fetch when the page is changed
    React.useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [page]);

    return (
        <main>
            <h2>Openverse Search</h2>

            <form onSubmit={(e) => { setPage(1); handleSearch(e); }}>
                <label htmlFor="query">Search:</label>
                <input
                    id="query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type here..."
                />

                <fieldset style={{ marginTop: "10px" }}>
                    {/*These are the same filters used on openverse.org's own search function.*/}
                    <legend>Advanced Filters</legend>

                    <label htmlFor="mediaType">Media Type</label>
                    <select id="mediaType" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                        <option value="all">All</option>
                        <option value="images">Images</option>
                        <option value="audio">Audio</option>
                    </select>

                    <label htmlFor="licenseType">License Type</label>
                    <select id="licenseType" value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
                        <option value="">Any</option>
                        <option value="all">All</option>
                        <option value="commercial">Commercial</option>
                        <option value="modification">Modification</option>
                    </select>

                    <label htmlFor="license">License</label>
                    <select id="license" value={license} onChange={(e) => setLicense(e.target.value)}>
                        <option value="">Any</option>
                        <option value="cc0">CC0</option>
                        <option value="by">CC BY</option>
                        <option value="by-sa">CC BY-SA</option>
                        <option value="by-nd">CC BY-ND</option>
                        <option value="by-nc">CC BY-NC</option>
                        <option value="by-nc-sa">CC BY-NC-SA</option>
                        <option value="by-nc-nd">CC BY-NC-ND</option>
                        <option value="pdm">Public Domain Mark</option>
                    </select>

                    <label htmlFor="category">Category</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Any</option>
                        <option value="photograph">Photograph</option>
                        <option value="illustration">Illustration</option>
                        <option value="digitized_artwork">Digitized Artwork</option>
                    </select>

                    <label htmlFor="extension">File Extension</label>
                    <select id="extension" value={extension} onChange={(e) => setExtension(e.target.value)}>
                        <option value="">Any</option>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                        <option value="gif">GIF</option>
                        <option value="svg">SVG</option>
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                    </select>

                    <label htmlFor="aspectRatio">Aspect Ratio</label>
                    <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                        <option value="">Any</option>
                        <option value="square">Square</option>
                        <option value="wide">Wide</option>
                        <option value="tall">Tall</option>
                    </select>

                    <label htmlFor="size">Size</label>
                    <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                        <option value="">Any</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>

                    <label htmlFor="source">Source</label>
                    <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
                        {/*I would've liked to include all of the source filters provided on openverse.org for both audio and images, but the list was too daunting.*/}
                        <option value="">Any</option>
                        <option value="animaldiversity">Animal Diversity Web</option>
                        <option value="bib_gulbenkian">Gulbenkian Art Library</option>
                        <option value="bio_diversity">Biodiversity Heritage Library</option>
                        <option value="flickr">Flickr</option>
                        <option value="freesound">Freesound</option>
                        <option value="jamendo">Jamendo</option>
                        <option value="met">Metropolitan Museum</option>
                        <option value="pexels">Pexels</option>
                        <option value="wikimedia">Wikimedia</option>
                    </select>
                    
                </fieldset>

                <button type="submit" style={{ marginTop: "10px" }}>Search</button>
            </form>

            {error && (
                <p aria-live="assertive" style={{ color: "red" }}>{error}</p>
            )}

            {/* Page Counter (Top) */}
                {results.length > 0 && (
                    <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button onClick={goToPrevPage} disabled={page === 1}>
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button onClick={goToNextPage}>
                            Next
                        </button>
                    </div>
                )}

            <section aria-label="Search Results" style={{ marginTop: "20px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "20px"
                    }}
                >
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <figure
                                key={index}
                                style={{
                                    border: "1px solid #16161d",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    backgroundColor: "#fff8e7",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                {item.type === "images" ? (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "block" }}
                                    >
                                        <img
                                            src={item.thumbnail || item.url}
                                            alt={item.title}
                                            style={{ width: "100%", borderRadius: "4px" }}
                                        />
                                    </a>
                                ) : (
                                    <audio controls style={{ width: "100%" }}>
                                        <source src={item.url} />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                                <figcaption style={{ marginTop: "8px", fontSize: "0.9em" }}>
                                    <strong>{item.title}</strong><br />
                                    <em>Creator:</em> {item.creator}<br />
                                    <em>Source:</em> {item.sourceSite}<br />
                                    <em>License:</em> {item.license.toUpperCase()} {item.licenseVersion}
                                </figcaption>
                            </figure>
                        ))
                    ) : (
                        <p>Nothing to display. Try searching for something!</p>
                    )}
                </div>

                {/* Page Counter (Bottom) */}
                {results.length > 0 && (
                    <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button onClick={goToPrevPage} disabled={page === 1}>
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button onClick={goToNextPage}>
                            Next
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
};

export default ImageSearch;
