# slack-cleanup

Over a period of time, we end up having lots of channels and group conversations. Exitting them one by one is painful/not feasible. This bot allows to automate the same. You can define list of channels/conversations to keep/stay in, list to exit/leave and default rule for conversations/channels in neither of the two lists. As of now, regex matching is not implemented.

* Read list of allowed/keep/stay channels
* Read list of denied/remove/leave channels
* List all user.conversations
* Stay has higher priority than Leave
* Default [allow] (stay)
* Default - ask for confimration before leaving each channel
* Default without any args = NO-OP
* Not leaving private channel as last member to allow for manual review
* export OAUTH_TOKEN=xoxp-....

Below on docker sets to leave all kind of conversations (public channel, private channel, DMs(IMs) and Groups).

```docker run -e OAUTH_TOKEN=$OAUTH_TOKEN -it -v `pwd`:/bin/data slack-cleanup /bin/slack-cleanup -default-action-im=leave -default-action-mpdm=leave -default-action-private=leave -default-action-public=leave -confirm-leave-note=false -ask-for-confirmation=false```

```
Usage of /bin/slack-cleanup:
  -ask-for-confirmation
    	Default value for confirmation check (default true)
  -confirm-leave-note
    	Ask before sending leaving note (default true)
  -default-action-im string
    	Default value for DM/IM conversation  (leave/stay) (default "stay")
  -default-action-mpdm string
    	Default value for Multi Persom Direct Message conversations  (leave/stay) (default "stay")
  -default-action-private string
    	Default value for Private channels not specified in either list (leave/stay) (default "stay")
  -default-action-public string
    	Default value for Public channels not specified in either list  (leave/stay) (default "stay")
  -leave-file string
    	Path to file with list of channels to leave (default "data/leave_channels.txt")
  -leave-message-file string
    	File containing custom leaving note [default message] (default "data/leave-note.txt")
  -list-all-conversations
    	List all conversations, useful for preparing stay/leave lists [false]
  -send-leave-note
    	Send in a note about leaving the conversation (default true)
  -stay-file string
    	Path to file with list of channels to stay in (default "data/stay_channels.txt")