(function(window, document) {
  'use strict';

  chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);


    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //  console.log(tabs[0].url);
    //  var port = chrome.tabs.connect(tabs[0].id);
    //  port.postMessage({url: tabs[0].url});
    //  port.onMessage.addListener(function(msg) {
    //    console.log(msg);
    //  });
    //  //, function(response) {
    //  //  console.log(response);
    //  //});
    //});

    //chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    //  console.log(tabs[0].url);
    //});

  });

  chrome.browserAction.setBadgeText({text: 'Infer'});

  console.log('Event Page for Browser Action');


  //chrome.commands.onCommand.addListener(function(command) {
  //  if (command == "toggle-pin") {
  //    // Get the currently selected tab
  //    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //      // Toggle the pinned status
  //      var current = tabs[0]
  //      chrome.tabs.update(current.id, {'pinned': !current.pinned});
  //    });
  //  }
  //});

}(window, document));