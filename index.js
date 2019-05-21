window.onload = function() {
  // Create constants
  const section = document.querySelector('section');
  const videos = [
    { 'url' : 'https://citia.com/content/organization/scratch-viacom/cards/jennifer-lopez-the-r.20181213-200352/media/a4182c61-31eb-4da9-be7f-ce9cb971c45f.mp4' },
    { 'url' : 'https://citia.com/content/organization/scratch-viacom/cards/dbd-q4-marketing-eff.20181031-141858/media/6fdc9f62-f634-4d18-b415-d7e7f86a7203.mp4' },
    { 'url' : 'https://citia.com/content/organization/scratch-viacom/cards/bbc-3-promos-october.20181026-182906/media/246a084d-35a3-4ff2-b27d-f9fe899e5428.mp4' },
    { 'url' : 'https://citia.com/content/organization/scratch-viacom/cards/mtv-eoy-music/media/0e797039-075d-48f1-a53b-767f840c540f.mp4' },
    { 'url' : 'https://citia.com/content/organization/test-titles-sandbox/cards/video-test/media/dc81c995-cdcb-4c5f-86d8-226b18fb0173.mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/15dca88b-38e9-48c3-abd0-e87404ba790e.mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/SampleVideo_1280x720_1mb.mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/SampleVideo_1280x720_20mb (1).mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/Cloud Formation Video.mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/metaxas-keller-Bell.mp4' },
    { 'url' : 'https://kaplaner.github.io/apache-localhost-test-ios/lion-sample.mp4' }
  ];
  // Create an instance of a db object for us to store our database in
  let db;

  function init() {
    // Loop through the video names one by one
    for(let i = 0; i < videos.length; i++) {
      // Open transaction, get object store, and get() each video by name
      let objectStore = db.transaction('videos').objectStore('videos');
      let request = objectStore.get(videos[i].url);
      request.onsuccess = function() {
        // If the result exists in the database (is not undefined)
        if(request.result) {
          // Grab the videos from IDB and display them using displayVideo()
          alert('taking videos from IDB');
          console.log('taking videos from IDB');
          // displayVideo(request.result.mp4, request.result.webm, request.result.url);
          changeUrlWithBlob(request.result.mp4, request.result.webm, request.result.url);
        } else {
          // Fetch the videos from the network
          fetchVideoFromNetwork(videos[i]);
        }
      };
    }
  }

  // Define the fetchVideoFromNetwork() function
  function fetchVideoFromNetwork(video) {
    alert('fetching videos from network');
    console.log('fetching videos from network');
    // Fetch the MP4 and WebM versions of the video using the fetch() function,
    // then expose their response bodies as blobs
    let mp4Blob = fetch(video.url).then(response =>
      response.blob()
    );
    let webmBlob = fetch('videos/' + video.name + '.webm').then(response =>
      response.blob()
    );

    // Only run the next code when both promises have fulfilled
    Promise.all([mp4Blob, webmBlob]).then(function(values) {
      // store it in the IDB using storeVideo()
      storeVideo(values[0], values[1], video.url);

      // display the video fetched from the network with displayVideo()
      // displayVideo(values[0], values[1], video.url);
      changeUrlWithBlob(values[0], values[1], video.url);
    });
  }

  // Define the storeVideo() function
  function storeVideo(mp4Blob, webmBlob, url) {
    // Open transaction, get object store; make it a readwrite so we can write to the IDB
    let objectStore = db.transaction(['videos'], 'readwrite').objectStore('videos');
    // Create a record to add to the IDB
    let record = {
      mp4 : mp4Blob,
      webm : webmBlob,
      url : url
    }

    // Add the record to the IDB using add()
    let request = objectStore.add(record);

    request.onsuccess = function() {
      alert('Record addition attempt finished');
      console.log('Record addition attempt finished');
    }

    request.onerror = function() {
      alert(request.error);
      console.log(request.error);
    }
  };

  function changeUrlWithBlob(mp4Blob, webmBlob, title) {
    let mp4URL = URL.createObjectURL(mp4Blob);
    // let webmURL = URL.createObjectURL(webmBlob);

    var selector = 'source[src="' + title + '"]';
    var sourceEl = document.querySelector(selector);
    if (sourceEl === null) {
        return;
    } else {
        var videoEl = sourceEl.parentNode;
    }

    var newSourceEl = document.createElement('source');
    newSourceEl.src = mp4URL;
    newSourceEl.type = 'video/mp4';
    
    videoEl.innerHTML = '';
    videoEl.appendChild(newSourceEl);
    videoEl.load();
  }

  // Define the displayVideo() function
  // function displayVideo(mp4Blob, webmBlob, title) {
  //   // Create object URLs out of the blobs
  //   let mp4URL = URL.createObjectURL(mp4Blob);
  //   let webmURL = URL.createObjectURL(webmBlob);

  //   // Create DOM elements to embed video in the page
  //   let article = document.createElement('article');
  //   let h2 = document.createElement('h2');
  //   h2.textContent = title;
  //   let video = document.createElement('video');
  //   video.controls = true;
  //   let source1 = document.createElement('source');
  //   source1.src = mp4URL;
  //   source1.type = 'video/mp4';
  //   let source2 = document.createElement('source');
  //   source2.src = webmURL;
  //   source2.type = 'video/webm';

  //   // Embed DOM elements into page
  //   section.appendChild(article);
  //   article.appendChild(h2);
  //   article.appendChild(video);
  //   video.appendChild(source1);
  //   video.appendChild(source2);
  // }

  // Open our database; it is created if it doesn't already exist
  // (see onupgradeneeded below)
  let request = window.indexedDB.open('videos', 1);

  // onerror handler signifies that the database didn't open successfully
  request.onerror = function() {
    console.log('Database failed to open');
  };

  // onsuccess handler signifies that the database opened successfully
  request.onsuccess = function() {
    alert('Database opened succesfully');
    console.log('Database opened succesfully');

    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;
    
    // Show if we have something in indexedDB / for standalone mode 
    var transaction = db.transaction(["videos"], "readonly");
    var objectStore = transaction.objectStore("videos");

    objectStore.getAllKeys().onsuccess = function(event) {
      alert("Got all videos: " + event.target.result.join("\n"));
    };
    init();
  };

  // Setup the database tables if this has not already been done
  request.onupgradeneeded = function(e) {

    // Grab a reference to the opened database
    let db = e.target.result;

    // Create an objectStore to store our notes in (basically like a single table)
    // including a auto-incrementing key
    let objectStore = db.createObjectStore('videos', { keyPath: 'url' });

    // Define what data items the objectStore will contain
    objectStore.createIndex('mp4', 'mp4', { unique: false });
    objectStore.createIndex('webm', 'webm', { unique: false });
    
    alert('Database setup complete');
    console.log('Database setup complete');
  };

  // Register service worker to control making site work offline

  if('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('sw.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
};
