window.onload = function() {
  // Create constants
  const section = document.querySelector('section');
  const videos = [
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/crystal.mp4' },
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/elf.mp4' },
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/frog.mp4' },
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/monster.mp4' },
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/pig.mp4' },
    // { 'url' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/rabbit.mp4' }
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/crystal.webm' },
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/elf.webm' },
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/frog.webm' },
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/monster.webm' },
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/pig.webm' },
    // { 'name' : 'https://mdn.github.io/learning-area/javascript/apis/client-side-storage/cache-sw/video-store-offline/videos/rabbit.webm' }
    {'url' : 'https://develop.citia.com/content/organization/anthonys-sandbox/cards/video-card-4.4/media/15dca88b-38e9-48c3-abd0-e87404ba790e.mp4'}
    // {'url' : 'https://develop.citia.com/content/organization/anthonys-sandbox/cards/video-card-3.2/media/ba93fdea-afdf-4714-bead-27cbfe634b83.mp4'},
    // {'url' : 'https://develop.citia.com/content/organization/anthonys-sandbox/cards/video-card-2/media/226b86f2-46e2-46b9-adf5-7ecba6275b64.mp4'},
    // {'url' : 'https://develop.citia.com/content/organization/anthonys-sandbox/cards/video-card-1/media/e0c9c54a-0842-49bd-8250-e7ac440d8fd3.mp4'},

    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/video-card-4/media/f8a70851-2c2f-4690-9df3-c4c3ef71f0e9.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/video-card-test/media/9ca26d33-d924-4a59-af1c-70b1eb1b668e.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/video-1/media/f30d64f1-9e98-4392-ad09-2d0548e32998.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/a-new-video-trans-ca/media/093e3307-224d-4566-9d17-35aaf821ebf3.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/video-card-3/media/c70cd345-9bbf-44c5-90d0-ce00d849976f.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/video-card-4.2/media/630126c2-cc45-4342-a775-658f5476fd96.mp4'},
    // {'url' : 'https://citia.com/content/organization/romans-org/cards/june-20th-video-card/media/200901db-76f8-4064-8bbc-54bf6251d00d.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/another-video-test-c/media/0d221f7d-a2fa-4394-b97d-e1bf367d736d.mp4'},
    // {'url' : 'https://citia.com/content/organization/anthonys-sandbox/cards/new-big-video/media/c43a163e-95f1-4b24-ad88-14dd5c11715b.mp4'}
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
      console.log('Record addition attempt finished');
    }

    request.onerror = function() {
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
    console.log('Database opened succesfully');

    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;
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

    console.log('Database setup complete');
  };

  // Register service worker to control making site work offline

  if('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('/sw.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
};
