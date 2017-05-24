/*Listen for whatif click*/
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript(tab.id, {
    code: 'document.getElementById("whatIf").style = "";'
  });
});

/*eslint-env browser, jquery*/
// Saves options to chrome.storage
function save_options() {
  var days = document.querySelectorAll('days').value;
  var htmltoggle = document.getElementById('htmltoggle').checked;
  var showOnCourse = document.getElementById('showOnCourse').checked;
  var showGrades = document.getElementById('showGrades').checked;
  var moreSpacing = document.getElementById('moreSpacing').checked;
  chrome.storage.sync.set({
    days: days,
    htmltoggle: htmltoggle,
    showOnCourse: showOnCourse,
    showGrades: showGrades,
    moreSpacing: moreSpacing
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  chrome.storage.sync.get({
    days: 7,
    htmltoggle: false,
    showOnCourse: false,
    showGrades: false,
    moreSpacing: false
  }, function (items) {
    document.getElementById('days').value = items.days;
    document.getElementById('htmltoggle').checked = items.htmltoggle;
    document.getElementById('showOnCourse').checked = items.showOnCourse;
    document.getElementById('showGrades').checked = items.showGrades;
    document.getElementById('moreSpacing').checked = items.moreSpacing;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);

document.addEventListener('DOMContentLoaded', function () {

  // IF A TOOLBOX CHANGES, SAVE OPTIONS
  $('input').change(save_options);
});
