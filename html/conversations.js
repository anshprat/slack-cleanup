oauthdata = sessionStorage.getItem("access_token");

let formdata = new FormData();
formdata.append("token", oauthdata);
ctypes = "";
formdata.append("limit", conversation_count);
formdata.append("exclude_archived", "true")

for (let c_type of conversation_types) {
    count_tracker.set(c_type, 0);
}

async function conversationsList(cursor = 0) {
    url = slack_base_url + "users.conversations";
    fetchMethod = "POST"
    // url = "/g5.json"
    // fetchMethod = "GET"

    if (fetchMethod == "POST") {
        fetchOptions.body = formdata;
        fetchOptions.method = "POST";
    } else if (fetchMethod == "GET") {
        fetchOptions.method = "GET";
    }
    if (cursor != 0) {
        url = url + "?cursor=" + cursor;
    }

    const responsel = await fetch(url, fetchOptions)
        .catch(function (error) {
            console.log(error);
        });
    const datac = await responsel.json();
    if (datac.ok) {
        var conversations = [];
        channels = datac['channels'];
        for (var cid in channels) {
            channel_map = new Map();
            // console.log(cid);
            channel = channels[cid];
            if (channel["name"] == "general") {
                // cannot leave general
                continue;
            }
            if (channel["is_channel"] && !channel["is_private"] && !channel["is_im"] && !channel["is_mpim"]) {
                // channel_map.set("id", "public_channel-" + channel["id"]);
                channel_map.set("id", channel["id"]);
                channel_map.set("type", "public_channel");
                channel_map.set("name", channel["name"]);
            }
            if (channel["is_channel"] && channel["is_private"] && !channel["is_im"] && !channel["is_mpim"]) {
                channel_map.set("id", "private_channel-" + channel["id"]);
                channel_map.set("type", "private_channel");
                channel_map.set("name", channel["name"]);
            }
            if (!channel["is_channel"] && !channel["is_private"] && channel["is_im"] && !channel["is_mpim"]) {
                im_is_open = await is_open(channel, cid, channels.length);
                if (im_is_open == "true")
                // if (channel["is_open"]||channel["updated"]>ndaysagots)
                {
                    // console.log(sessionStorage.getItem(channel["id"]));
                    channel_map.set("id", "im-" + channel["id"]);
                    channel_map.set("type", "im");
                    channel_map.set("name", channel["user"]);
                }else{
                    // console.log(im_is_open,(im_is_open)=="true", im_is_open === true);
                }
            }
            if (channel["is_mpim"]) {
                mpim_is_open = await is_open(channel, cid, channels.length);
                if (mpim_is_open == "true")
                // if (channel["is_open"]||channel["updated"]>ndaysagots)
                {
                    channel_map.set("id", "mpim-" + channel["id"]);
                    channel_map.set("type", "mpim");
                    channel_map.set("name", channel["name"]);
                }

            }
            // MPIM converted to channel
            if (!channel["is_channel"] && channel["is_private"] && channel["is_group"] && !channel["is_mpim"]) {
                channel_map.set("id", "private_channel-" + channel["id"]);
                channel_map.set("type", "private_channel");
                channel_map.set("name", channel["name"]);
            }
            var conversationobj = Object.fromEntries(channel_map);
            var jsonString = JSON.stringify(conversationobj);
            if (jsonString.length > 2) {
                conversations.push(conversationobj);
            } else {

            }

        }
        modalConversations(conversations);
        if ((datac['response_metadata']['next_cursor']).length > 0) {
            cursor = datac['response_metadata']['next_cursor'];
            conversationsList(cursor);
        }
    } else {
        if (datac.error == "invalid_auth") {
            window.location = "/"
        }
    }


}


function getConversations() {
    for (let ctype of conversation_types) {
        if (formdata.get("types")) {
            formdata.set("types", ctype);
        } else {
            formdata.append("types", ctype);
        }
        conversationsList();
    }
    try {addDefaultoptions();} catch {}
}

getConversations();

