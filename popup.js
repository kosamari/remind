'use strict'

var url = ''
var reminders = []
var failedRequests = []
var setEl = document.getElementById('set')
var bookmarkEl = document.getElementById('bookmark')
var bookmarkListEl = document.getElementById('bookmark-list')
var inputEl = document.getElementById('input')
var editorEl = document.getElementById('editor')
var errorEl = document.getElementById('error')

function init () {
  // create bookmark list in popup
  var bookmarks = getBookmarks()
  bookmarks.forEach(function (url) {
    appendBookmark(url)
  })

  // check if the active tab is slack page
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    url = tabs[0].url
    if (url.indexOf('.slack.com/messages/') > -1) {
      // it is a slack page! show the input UI.
      editorEl.style.display = 'block'
      // if url is not part of bookmark, also show bookmark button
      updateBookmarkBtn()
      return
    }
  })
}

// Bookmarks
function getBookmarks () {
  return JSON.parse(localStorage.getItem('bookmark')) || []
}

function updateBookmarkBtn () {
  var bookmarks = getBookmarks()
  if (bookmarks.indexOf(url) === -1) {
    bookmarkEl.style.display = 'inline-block'
  } else {
    bookmarkEl.style.display = 'none'
  }
}

function deleteBookmark (url, el) {
  var bookmarks = getBookmarks()
  var index = bookmarks.indexOf(url)
  bookmarks.splice(index, 1)
  localStorage.setItem('bookmark', JSON.stringify(bookmarks))
  el.parentNode.remove()
}

function appendBookmark (url) {
  var slackName = url.split('/')[2].split('.')[0]
  var channelName = url.split('/')[4]

  var div = document.createElement('div')
  var name = document.createElement('span')
  var del = document.createElement('span')
  name.innerHTML = `${slackName}/${channelName}`
  name.id = `${slackName}-${channelName}`
  del.className = 'del'
  del.innerHTML = 'x'
  del.addEventListener('click', function () {
    deleteBookmark(url, this)
    updateBookmarkBtn()
  })
  name.addEventListener('click', function () {
    chrome.tabs.create({url: url})
  })
  div.className = 'bookmark-item'
  div.appendChild(name)
  div.appendChild(del)
  bookmarkListEl.appendChild(div)
}

// Functions to set reminders
function setReminder () {
  inputEl.value = reminders.join('\n')
  injectToSlack(reminders.shift())
}

function clearTextarea () {
  if (failedRequests.length) {
    errorEl.style.display = 'block'
  }
  inputEl.value = failedRequests.join('\n')
  failedRequests = []
}

function injectToSlack (msg) {
  var code = `
    var input = document.getElementById('message-input')
    var inputVal = '/remind ${msg}'
    input.value = inputVal
    var submitScript = document.createElement('script')
    submitScript.textContent = 'TS.view.submit()'
    document.head.appendChild(submitScript)
    setTimeout(function () {
      var spans = document.getElementById('msgs_div').lastElementChild.lastElementChild.childNodes
      for (var i = 0; i < spans.length; i++) {
        if (spans[i].className === 'message_body') {
          if (spans[i].innerText.startsWith(':thumbsup: I will remind you')) {
            chrome.extension.sendRequest({ type: 'set_reminder', state: true, data: '${msg}' })
          } else {
            chrome.extension.sendRequest({ type: 'set_reminder', state: false, data: '${msg}' })
          }
          break
        }
      }
    }, 500)
  `

  if (msg === '') {
    setReminder()
  } else {
    chrome.tabs.executeScript({
      code: code
    })
  }
}

// Event Listeners
// This is event called from injectToSlack()
chrome.extension.onRequest.addListener(function (msg) {
  if (msg.type === 'set_reminder') {
    if (!msg.state) {
      // failed to set reminder on slack
      failedRequests.push(msg.data)
    }
    if (reminders.length > 0) {
      setReminder()
    } else {
      clearTextarea()
    }
  }
})

// Set reminders btn
setEl.addEventListener('click', function () {
  errorEl.style.display = 'none'
  if(input.value){
    reminders = inputEl.value.split('\n')
    setReminder()
  }
})

// Bookmark this page btn
bookmarkEl.addEventListener('click', function () {
  var bookmarks = getBookmarks()
  bookmarks.push(url)
  localStorage.setItem('bookmark', JSON.stringify(bookmarks))
  appendBookmark(url)
  updateBookmarkBtn()
})

document.addEventListener('DOMContentLoaded', init());