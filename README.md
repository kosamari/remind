# /remind for Slack

## About 
This is a Chrome Extension which interact with Slack to send slash command messages in batch. I made this tool to set reminders in batch.
Note: This extension only works when you are on Slack web interface (`https://*.slack.com/messages/*`).

## How to set reminders
Click on extension icon and add reminders in the text field. it should be formatted as 
`[someone or #channel] [text] [some description of time]` (i.e `me to drink water at 3pm` or `@luke to check on project status tonight`)
Each line in the text field is treated as one reminder message. Hit send to set it on slack.

![remind](https://cloud.githubusercontent.com/assets/4581495/13371440/ff210310-dcf3-11e5-8cd4-6b71c8cd4f09.gif)

## Set reminders to single person/group
You can edit command field to include person or channel you are sending reminder to, so you don't have to write same name every line.

![set single person](https://cloud.githubusercontent.com/assets/4581495/13371412/7e1048f8-dcf3-11e5-86bd-f68243b9e91a.png)


## Use different slack commands
You can edit entire command field to what you like. Post a batch of Giphy links, maybe?

![giphy](https://cloud.githubusercontent.com/assets/4581495/13371352/947a0cce-dcf2-11e5-9b7e-080c2ac9115d.gif)

## Bookmark channels
You can bookmark channels you post often. To add bookmark, click `+ bookmark` button.

![bookmark](https://cloud.githubusercontent.com/assets/4581495/13371401/5ba48dba-dcf3-11e5-89ef-766bd84a9a58.png)

## FAQ

### Why did you make this? 
I've been using slack reminder to keep track of loose todo list like "write email to ___ this afternoon" or "read this paper tonight". These are something that is not quite time specific to add to calendar yet things I have vague idea of when to work on. Usually I write down handful them in the morning & set reminders on slack one by one. I wanted the way to set it all at once.

Once slackbot reminds me things to do, I can mark as complete or set to remind me again (or snooze) easily.
![slackbot](https://cloud.githubusercontent.com/assets/4581495/13371552/1cb0b06c-dcf7-11e5-8045-850d65059bb7.png)


### Why does Slack page need to be open to use this?
Slack API does not allow user to send slash commands. This extension is directory injecting JavaScript to set commands programmatically 