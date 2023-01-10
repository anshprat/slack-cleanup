package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/slack-go/slack"
)

func main() {

	// https://gobyexample.com/command-line-flags https://go.dev/play/p/IUPZlYSigc3

	// useFiles := flag.Bool("use-files", false, "Use the default or custom files for any options [false]")
	stayFile := flag.String("stay-file", "data/stay_channels.txt", "Path to file with list of channels to stay in")
	leaveFile := flag.String("leave-file", "data/leave_channels.txt", "Path to file with list of channels to leave")
	askForConfirmation := flag.Bool("ask-for-confirmation", true, "Default value for confirmation check")
	defaultActionPrivate := flag.String("default-action-private", "stay", "Default value for Private channels not specified in either list (leave/stay)")
	defaultActionPublic := flag.String("default-action-public", "stay", "Default value for Public channels not specified in either list  (leave/stay)")
	defaultActionIM := flag.String("default-action-im", "stay", "Default value for DM/IM conversation  (leave/stay)")
	defaultActionMPDM := flag.String("default-action-mpdm", "stay", "Default value for Multi Persom Direct Message conversations  (leave/stay)")
	listAllConversations := flag.Bool("list-all-conversations", false, "List all conversations, useful for preparing stay/leave lists [false]")
	sendLeaveNote := flag.Bool("send-leave-note", true, "Send in a note about leaving the conversation")
	leaveNoteFile := flag.String("leave-message-file", "data/leave-note.txt", "File containing custom leaving note [default message]")
	askForLeaveNoteConfirm := flag.Bool("confirm-leave-note", true, "Ask before sending leaving note")

	flag.Parse()
	// fmt.Println(*askForConfirmation, *defaultActionPrivate, *defaultActionPublic, *defaultActionIM, *defaultActionMPDM)
	// fmt.Println(*askForConfirmation)

	if len(os.Args) == 1 {
		fmt.Println("This is a NOOP without any args, please see help with -h")
		return
	}

	OAUTH_TOKEN := os.Getenv("OAUTH_TOKEN")

	api := slack.New(OAUTH_TOKEN)

	// Based upon https://github.com/jpbruinsslot/slack-term/blob/c19c20a3e5c597d6d60582fcba1a3523415e8fe4/service/slack.go#L77

	slackChans := make([]slack.Channel, 0)

	// Initial request
	initChans, initCur, err := api.GetConversationsForUser(
		&slack.GetConversationsForUserParameters{
			ExcludeArchived: true,
			Limit:           1000,
			Types: []string{
				"public_channel",
				"private_channel",
				"im",
				"mpim",
			},
		},
	)
	processErr(err)

	slackChans = append(slackChans, initChans...)

	// Paginate over additional channels
	nextCur := initCur
	for nextCur != "" {
		channels, cursor, err := api.GetConversationsForUser(
			&slack.GetConversationsForUserParameters{
				Cursor:          nextCur,
				ExcludeArchived: true,
				Limit:           1000,
				Types: []string{
					"public_channel",
					"private_channel",
					"im",
					"mpim",
				},
			},
		)
		processErr(err)

		slackChans = append(slackChans, channels...)
		nextCur = cursor
	}

	leaveNote := ""
	stayList := readFile(*stayFile, "stay")

	leaveList := readFile(*leaveFile, "leave")

	leaveNoteContent := readFile(*leaveNoteFile, "note")

	if len(leaveNoteContent) > 0 {
		for line := range leaveNoteContent {
			leaveNote += line
		}

	}

	// if (len(leaveNote)){

	// }

	// if *listAllConversations {
	// 	// fmt.Printf("ChannelName, IsPrivate, IsPublic, IsIM, IsMpIM\n")
	// 	fmt.Printf("ChannelName, IsPrivate, IsPublic, IsIM, IsMpIM\n")
	// }

	// len_conversations := len(slackChans)
	var public_channels []string
	var private_channels []string
	var list_IM []string
	var list_MPDM []string

	for _, channel := range slackChans {

		// is public_channel

		if channel.IsChannel && !channel.IsPrivate && !channel.IsIM && !channel.IsMpIM {
			public_channels = append(public_channels, channel.Name)
		}

		// is private_channel

		if channel.IsChannel && channel.IsPrivate && !channel.IsIM && !channel.IsMpIM {
			private_channels = append(private_channels, channel.Name)

		}

		// is_IM

		if !channel.IsChannel && !channel.IsPrivate && channel.IsIM && !channel.IsMpIM {
			list_IM = append(list_IM, channel.User)
			// fmt.Println(channel)

		}

		// is_MPDM

		if !channel.IsChannel && channel.IsPrivate && !channel.IsIM && channel.IsMpIM {
			list_MPDM = append(list_MPDM, channel.Name)
		}

		// fmt.Println(channel.Name, channel.IsChannel, channel.IsPrivate, channel.IsIM, channel.IsMpIM)

	}

	if *listAllConversations {
		// fmt.Println(channel.Name, channel.IsChannel, channel.IsPrivate, channel.IsIM, channel.IsMpIM)
		// fmt.Println(channel.Name, channel.User)
		for _, public_channel := range public_channels {
			fmt.Println("public_channel", public_channel)
		}
		for _, private_channel := range private_channels {
			fmt.Println("private_channel", private_channel)
		}
		for _, IM := range list_IM {
			fmt.Println("IM", IM)
		}
		for _, MPDM := range list_MPDM {
			fmt.Println("MPDM", MPDM)
		}

		fmt.Println("public_channels ", len(public_channels), "private_channels ", len(private_channels), "IMs ", len(list_IM), " MPDMs ", len(list_MPDM), "Total ", len(slackChans))
		// fmt.Println(public_channels, private_channels, is_IM, is_MPDM)
		return
	}

	for _, channel := range slackChans {

		message := ""
		_, ok := stayList[channel.Name]
		if ok {
			// fmt.Println("Key Present and value is= ", channel.Name, value)
		} else if !ok {
			// fmt.Println(" Key Not Present ", channel.Name, channel.ID)
			_, ok = leaveList[channel.Name]
			if ok {
				// Present in leave list, post message and leave
				// https://godoc.org/github.com/nlopes/slack#Client.PostMessage

				if *askForConfirmation {
					message = InputPrompt("Do you want to leave " + channel.Name + " ?(y/n)[n]")
				}
				if message == "y" || !*askForConfirmation {
					leaveCloseConversations(channel, api, *sendLeaveNote, leaveNote, *askForLeaveNoteConfirm)
				}

			} else {
				// process the defaults
				if channel.IsChannel && *defaultActionPublic == "stay" {
					// stay
				} else if channel.IsPrivate && *defaultActionPrivate == "stay" {
					// stay
				} else if channel.IsIM && *defaultActionIM == "stay" {
					// stay
				} else if channel.IsMpIM && *defaultActionMPDM == "stay" {
					// stay
				} else {
					if *askForConfirmation {
						message = InputPrompt("Do you want to leave " + channel.Name + channel.ID + " ?(y/n)[n]")
					}
					if message == "y" || !*askForConfirmation {
						leaveCloseConversations(channel, api, *sendLeaveNote, leaveNote, *askForLeaveNoteConfirm)
					}
				}

			}

		}
	}

}

func readFile(filePath string, action string) map[string]string {

	readFile, err := os.Open(filePath)

	processErr(err)

	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	var channelList = make(map[string]string)
	for fileScanner.Scan() {
		channelList[fileScanner.Text()] = action
	}

	readFile.Close()

	return channelList

}

func leaveCloseConversations(channel slack.Channel, api *slack.Client, sendLeaveNote bool, leaveNote string, confirmMessage bool) {
	postParams := slack.MsgOptionPostMessageParameters(slack.PostMessageParameters{
		AsUser:    true,
		LinkNames: 1,
	})
	message := ""
	// channelsCount := len(slackChans)
	if len(leaveNote) > 0 {
		message = leaveNote
	} else {
		message = `Hello, I am doing some housekeeping of my slack conversations. 
		I am leaving most conversations automatically using a bot. 
		If you need me again in this conversation, please add me back, thank you! `
	}

	text := slack.MsgOptionText(message, true)

	public_channel := channel.IsChannel && !channel.IsPrivate
	private_channel := channel.IsChannel && channel.IsPrivate && !channel.IsMpIM
	im := channel.IsIM
	mpim := channel.IsMpIM
	fmt.Println("Processing " + channel.Name + " for leaving")
	if public_channel || private_channel {

		if sendLeaveNote {
			if confirmMessage {
				message = InputPrompt("Do you want to send message in " + channel.Name + " about leaving?(y/n)[n]" + message)
			}
			if (message == "y" || !confirmMessage) && !channel.IsGeneral {
				_, _, err := api.PostMessage(channel.ID, text, postParams)
				processErr(err)

			}

		}
		// fmt.Println(channel.Name, channel.User, channel.IsPrivate, channel.IsChannel, channel.IsIM, channel.IsMpIM, channel.IsGroup, channel.IsGeneral)
		_, err := api.LeaveConversation(channel.ID)
		processErr(err)
		if err != nil {
			fmt.Println("Error leaving ", channel.Name)
			if err.Error() == "last_member" {
				err := api.ArchiveConversation(channel.ID)
				processErr(err)
			}

		} else {
			fmt.Println("Left " + channel.Name)
		}
		return
	}

	if im || mpim {
		// IsMpIM also has IsChannel and IsPrivate true. Hence process this before processing channels/privates.
		// fmt.Println(channel.Name, channel.User, channel.IsPrivate, channel.IsChannel, channel.IsIM, channel.IsMpIM, channel.IsGroup, channel.IsGeneral)
		_, _, err := api.CloseConversation(channel.ID)
		processErr(err)
		if err != nil {
			fmt.Println("Error leaving ", channel.Name, channel.ID)
		} else {
			fmt.Println("Left " + channel.Name)
		}

		return
	}

}

func processErr(err error) {
	if err != nil {
		fmt.Println(err)
	}
}

func InputPrompt(label string) string {
	var s string
	r := bufio.NewReader(os.Stdin)
	for {
		fmt.Fprint(os.Stderr, label+" ")
		s, _ = r.ReadString('\n')
		if s != "" {
			break
		}
	}
	return strings.TrimSpace(s)
}
