// ---------- Constants ----------
const SUCCESS_THRESHOLD = 12; // Minimum number of practices to trigger success
const API_OPTIONS = [ // List of animal image APIs and the keys to access image URLs
  { url: 'https://dog.ceo/api/breeds/image/random', key: 'message' },
  { url: 'https://aws.random.cat/meow', key: 'file' },
  { url: 'https://randomfox.ca/floof/', key: 'image' }
];

// ---------- DOM Ready ----------
document.addEventListener('DOMContentLoaded', () => {
  // Get references to all relevant DOM elements
  const checkboxes = document.querySelectorAll('.practice-check'); // All checkboxes
  const summary = document.getElementById('summary'); // Summary text
  const successMsg = document.getElementById('success-message'); // Success message element
  const rewardFigure = document.getElementById('animal-figure'); // Container for the reward image
  const rewardImg = document.getElementById('reward-img'); // Actual reward image
  const chartCanvas = document.getElementById('chart'); // Chart element
  const successSound = document.getElementById('success-sound'); // Audio element for success
  const resetBtn = document.getElementById('reset-button'); // Reset button
  const selectAllBtn = document.getElementById('select-all-button'); // Select All button

  const groups = ['HTML', 'CSS', 'JS']; // Categories of best practices
  let chart; // Chart instance (initialized later)

  // Initialize app state
  loadChecked(); // Load any saved checkbox states from localStorage
  bindCheckboxes(); // Add event listeners to checkboxes
  bindButtons(); // Add event listeners to buttons
  updateStats(); // Calculate stats and update UI

  // ---------- Utility Functions ----------

  // Displays the animal image reward
  function showAnimalImage(url) {
    const img = document.getElementById('reward-img');
    const fig = document.getElementById('animal-figure');

    img.src = url; // Set image source
    fig.style.display = 'block'; // Make figure visible
    setTimeout(() => {
      fig.style.opacity = 1; // Fade in
      img.classList.add('show'); 
    }, 200);
  }

  // Adds change listeners to all checkboxes
  function bindCheckboxes() {
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        saveChecked();  // Save current state
        updateStats();  // Recalculate stats
      });
    });
  }

  // Binds actions to buttons (reset and select all)
  function bindButtons() {
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('checkedPractices'); // Clear localStorage
        location.reload(); // Reload the page
      });
    }

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        checkboxes.forEach(cb => cb.checked = true); // Check all boxes
        saveChecked(); // Save new state
        updateStats(); // Recalculate stats
      });
    }
  }

  // Loads checked checkbox IDs from localStorage
  function loadChecked() {
    const saved = JSON.parse(localStorage.getItem('checkedPractices') || '[]');
    checkboxes.forEach(cb => {
      if (saved.includes(cb.dataset.id)) cb.checked = true;
    });
  }

  // Saves all checked checkbox IDs to localStorage
  function saveChecked() {
    const checkedIds = [...checkboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.id);
    localStorage.setItem('checkedPractices', JSON.stringify(checkedIds));
  }

  // Updates the total progress, chart, reward image, and message
  function updateStats() {
    const groupCounts = { HTML: 0, CSS: 0, JS: 0 };
    let total = 0;

    // Count checked boxes by group
    checkboxes.forEach(cb => {
      if (cb.checked) {
        total++;
        groupCounts[cb.dataset.group]++;
      }
    });

    // Update text summary
    summary.textContent = `You have met ${total}/15 best practices`;

    if (total >= SUCCESS_THRESHOLD) {
      // Show reward and success message
      successMsg.style.display = 'block';
      fetchAnimal(); // Get animal image from API
      successSound.play(); // Play success sound
    } else {
      // Hide reward and message if threshold not met
      successMsg.style.display = 'none';
      rewardFigure.style.display = 'none';
      rewardFigure.style.opacity = '0';
    }

    renderChart(groupCounts); // Update the chart
  }

  // Fetches a random animal image from a selected API
  function fetchAnimal() {
    const selected = API_OPTIONS[Math.floor(Math.random() * API_OPTIONS.length)];

    // Show loading state
    rewardImg.src = 'jpg/loading.gif';
    rewardFigure.style.display = 'block';
    rewardFigure.style.opacity = '0.5';

    // Fetch image from the API
    fetch(selected.url)
      .then(res => res.json())
      .then(data => {
        rewardImg.src = data[selected.key]; // Set image URL from returned data
        rewardFigure.style.opacity = '1'; // Fade in image
      })
      .catch(() => {
        // Show fallback message if fetch fails
        rewardImg.src = '';
        rewardFigure.innerHTML = '<p>🐢 Unable to fetch animal. Try again later.</p>';
      });
  }

  // Renders a bar chart showing completed practices per group
  function renderChart(counts) {
    const data = {
      labels: groups, // X-axis labels
      datasets: [{
        label: 'Completed',
        data: groups.map(g => counts[g]), // Y-axis data
        backgroundColor: ['#75a5b8', '#9fa4c4', '#cfc2ff'] // Bar colors
      }]
    };

    // Destroy previous chart if it exists
    if (chart) chart.destroy();

    // Create new chart
    chart = new Chart(chartCanvas, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 5
          }
        },
        plugins: {
          legend: {
            display: false // Hide legend
          }
        }
      }
    });
  }
});
