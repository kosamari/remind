'use strict'

var url = ''
var command = ''
var reminders = []
var failedRequests = []
var sendEl = document.getElementById('send')
var bookmarkEl = document.getElementById('bookmark')
var bookmarkListEl = document.getElementById('bookmark-list')
var inputEl = document.getElementById('input')
var editorEl = document.getElementById('editor')
var errorEl = document.getElementById('error')
var commandEl = document.getElementById('command')
var helpDocEl = document.getElementById('help-doc')
var helpEl = document.getElementById('help')

function init () {
  // create bookmark list in popup
  var bookmarks = getBookmarks()
  bookmarks.forEach(function (url) {
    appendBookmark(url)
  })

  // check if the active tab is slack page
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    url = tabs[0].url
    if (isSlackPage()) {
      // it is a slack page! show the input UI.
      editorEl.style.display = 'block'
      // if url is not part of bookmark, also show bookmark button
      updateBookmarkBtn()
      return
    } else if (bookmarks.length === 0){
      helpEl.style.display = 'inline-block'
    }
  })
}

function isSlackPage () {
  if (url.indexOf('.slack.com/messages/') > -1) {
    return true
  }
  return false
}

// Bookmarks
function getBookmarks () {
  return JSON.parse(localStorage.getItem('bookmark')) || []
}

function updateBookmarkBtn () {
  var bookmarks = getBookmarks()
  if (isSlackPage() && bookmarks.indexOf(url) === -1) {
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

// Functions to send messages
function setMessage () {
  command = commandEl.innerText.trim()
  inputEl.value = reminders.join('\n')
  injectToSlack(command, reminders.shift())
}

function clearTextarea () {
  if (failedRequests.length) {
    errorEl.style.display = 'block'
  }
  inputEl.value = failedRequests.join('\n')
  failedRequests = []
}

function escapeHtml (text) {
  return text.replace(/[\"&'\/<>]/g, function (a) {
    return {
      '"': '&quot;', '&': '&amp;', "'": '&#39;',
      '/': '&#47;',  '<': '&lt;',  '>': '&gt;'
    }[a]
  })
}

function injectToSlack (command, msg) {
  msg = escapeHtml(msg)
  var code = `
    var input = document.getElementById('message-input')
    var inputVal = "${command} ${msg}"
    input.value = inputVal.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&#47;/g, '/').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    var submitScript = document.createElement('script')
    submitScript.textContent = 'TS.view.submit()'
    document.head.appendChild(submitScript)
    setTimeout(function () {
      var spans = document.getElementById('msgs_div').lastElementChild.lastElementChild.childNodes
      for (var i = 0; i < spans.length; i++) {
        if (spans[i].className === 'message_body') {
          if (spans[i].innerText.startsWith("Sorry, I didn't quite get that")) {
            chrome.extension.sendRequest({ type: 'set_reminder', state: false, data: '${msg}' })
          } else {
            chrome.extension.sendRequest({ type: 'set_reminder', state: true, data: '${msg}' })
          }
          break
        }
      }
    }, 500)
  `

  if (msg === '') {
    setMessage()
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
    if (command.indexOf('/remind') === 0 && !msg.state) {
      // failed to set reminder on slack
      failedRequests.push(msg.data)
    }
    if (reminders.length > 0) {
      setMessage()
    } else {
      clearTextarea()
    }
  }
})

// Command
commandEl.addEventListener('click', function () {
  commandEl.contentEditable = 'true'
  commandEl.focus()
})
commandEl.addEventListener('blur', function () {
  commandEl.contentEditable = 'false'
})

// Help
helpDocEl.addEventListener('click', function () {
  chrome.tabs.create({url: 'https://github.com/kosamari/remind/blob/master/README.md'})
})

// send btn
sendEl.addEventListener('click', function () {
  errorEl.style.display = 'none'
  if(input.value){
    reminders = inputEl.value.split('\n')
    setMessage()
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