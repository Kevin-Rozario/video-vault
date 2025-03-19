// URL for fetching YouTube videos
const VIDEO_API_URL =
  "https://api.freeapi.app/api/v1/public/youtube/videos?page=1&limit=10&query=javascript&sortBy=keep%2520one%253A%2520mostLiked%2520%257C%2520mostViewed%2520%257C%2520latest%2520%257C%2520oldest";

// Fetch configuration options
const FETCH_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json" },
};

async function fetchVideos() {
  try {
    const response = await fetch(VIDEO_API_URL, FETCH_OPTIONS);
    const apiData = await response.json();

    // Map API response to structured video objects
    const videos = apiData.data.data.map((videoData) => ({
      thumbnail: videoData.items.snippet.thumbnails.high.url,
      link: `https://www.youtube.com/watch?v=${videoData.items.id}`,
      avatar: "https://avatars.githubusercontent.com/u/11613311?v=4",
      title: videoData.items.snippet.title,
      channel: videoData.items.snippet.channelTitle,
      views: `${formatCount(videoData.items.statistics.viewCount)} views`,
      likes: `${formatCount(videoData.items.statistics.likeCount)} likes`,
      comments: `${formatCount(
        videoData.items.statistics.commentCount
      )} comments`,
      duration: parseDuration(videoData.items.contentDetails.duration),
    }));
    return videos;
  } catch (error) {
    console.error("Failed to fetch video data.", error);
    return [];
  }
}

// Formats a numerical count string into a human-readable format.
function formatCount(countString) {
  const count = parseFloat(countString);
  return count >= 1000 ? `${(count / 1000).toFixed(2)}K` : `${count}`;
}

// Parses an ISO 8601 duration string into a formatted time string.
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = match && match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match && match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match && match[3] ? parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Creates a video card element for a given video object.
function createVideoCard(video) {
  // Create the anchor element that links to the video
  const videoLink = document.createElement("a");
  videoLink.href = video.link;
  videoLink.target = "_blank";
  videoLink.className = "block";

  // Create the card container with a dark background and shadow
  const card = document.createElement("div");
  card.className =
    "rounded-lg overflow-hidden shadow-lg bg-[#1E1E1E] flex flex-col h-full";

  // Create the thumbnail container with background image
  const thumbnailContainer = document.createElement("div");
  thumbnailContainer.className = "w-full h-48 bg-cover bg-center relative";
  thumbnailContainer.style.backgroundImage = `url('${video.thumbnail}')`;

  // Create a duration overlay displayed on the thumbnail
  const durationOverlay = document.createElement("div");
  durationOverlay.className =
    "absolute bottom-2 right-2 bg-[#0C0806] text-white text-xs px-2 py-1 rounded";
  durationOverlay.textContent = video.duration;
  thumbnailContainer.appendChild(durationOverlay);

  // Create the content container for video details
  const contentContainer = document.createElement("div");
  contentContainer.className = "p-4 flex flex-col flex-grow";

  // Header container for avatar and title/channel information
  const headerContainer = document.createElement("div");
  headerContainer.className = "flex items-center mb-3";

  // Avatar container
  const avatarContainer = document.createElement("div");
  avatarContainer.className =
    "w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0";
  const avatarImage = document.createElement("img");
  avatarImage.src = video.avatar;
  avatarImage.alt = `${video.channel} avatar`;
  avatarImage.className = "w-full h-full object-cover";
  avatarContainer.appendChild(avatarImage);

  // Container for title and channel info
  const titleChannelContainer = document.createElement("div");
  titleChannelContainer.className = "flex flex-col";
  const titleElement = document.createElement("h3");
  titleElement.className = "text-lg font-semibold text-white";
  titleElement.textContent = video.title;
  const channelElement = document.createElement("p");
  channelElement.className = "text-sm text-gray-400";
  channelElement.textContent = video.channel;
  titleChannelContainer.appendChild(titleElement);
  titleChannelContainer.appendChild(channelElement);

  // Append avatar and title/channel to the header container
  headerContainer.appendChild(avatarContainer);
  headerContainer.appendChild(titleChannelContainer);

  // Create metrics container for views, likes, and comments
  const metricsContainer = document.createElement("div");
  metricsContainer.className = "mt-auto flex justify-between items-center";
  const viewsElement = document.createElement("span");
  viewsElement.className = "text-xs text-gray-400";
  viewsElement.textContent = video.views;
  const likesElement = document.createElement("span");
  likesElement.className = "text-xs text-gray-400";
  likesElement.textContent = video.likes;
  const commentsElement = document.createElement("span");
  commentsElement.className = "text-xs text-gray-400";
  commentsElement.textContent = video.comments;
  metricsContainer.append(viewsElement, likesElement, commentsElement);

  // Assemble the card by appending all elements
  contentContainer.appendChild(headerContainer);
  contentContainer.appendChild(metricsContainer);
  card.appendChild(thumbnailContainer);
  card.appendChild(contentContainer);
  videoLink.appendChild(card);

  return videoLink;
}

// Renders video cards into the designated container.
function renderVideos(videos) {
  const container = document.getElementById("video-container");
  container.innerHTML = "";
  videos.forEach((video) => {
    container.appendChild(createVideoCard(video));
  });
}

// Store all fetched videos
let allVideos = [];

// Initialize fetching videos and attach search functionality once the DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  allVideos = await fetchVideos();
  renderVideos(allVideos);

  // Attach search input event listener to filter videos by title or channel
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      const filteredVideos = allVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.channel.toLowerCase().includes(query)
      );
      renderVideos(filteredVideos);
    });
  }
});