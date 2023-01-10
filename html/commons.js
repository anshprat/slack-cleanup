if (location.protocol != 'https:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
 }
 
const groups = [];
const searchBoxes = [];
const slack_base_url = "https://slack.com/api/";
const nDays = 30;
const nDaysAgo = new Date(Date.now() - nDays * 24 * 60 * 60 * 1000);
const ndaysagots = nDaysAgo.getTime()
const rl_tolerance = 0.9;
const rls = new Map();
const globalCountLimit = 15;

let showCountLimit = globalCountLimit;

const controlButtonsMap = new Map([
    ["prevPage", "Previous " + showCountLimit],
    ["stayAll", "Stay"],
    ["leaveAll", "Leave"],
    ["toggleLeaveStay", "Toggle Leave Stay"],
    ["resetToDefault", "Reset All to Default"],
    ["nextPage", "Next " + showCountLimit]
]);


rls.set("tiertwo", 20);
rls.set("tierthree", 50);

let convActions = ["stay", "leave"];
let radios = ["default"]
let data = "";
let process_leave = new Map();
let Total_Conversations = 0;
let conversation_opts = ["public_channel", "private_channel", "mpim", "im"];
let conversation_types = ["public_channel", "private_channel"];
// let conversation_types = ["im"];
let default_actions = new Map();
let default_action = "stay";
let conversation_count = 1000;
let console_count = 0;
let rl = 18;
let count_tracker = new Map();
let fetchMethod = "POST";
let fetchOptions = {};

fetchOptions.method = fetchMethod;

for (let c in convActions){
    radios.push(convActions[c]); 
}

for (let c in conversation_types) {
    ctype = conversation_types[c];
    default_actions.set(ctype, default_action);
    process_leave.set(ctype, 0)
}

// fetch("g5.json")
//     .then(response => response.json())
//     .then(jsonData => {
//         modalConversations(jsonData);
//     });

function sleep(time) {
    return new Promise((resolve) => { setTimeout(resolve, time) });
}

function countconversations(group) {
    var fieldsets = document.querySelectorAll('fieldset[id^="' + group + '-"]');
    c = document.getElementById("text-" + group);
    c.innerHTML = group + " (" + fieldsets.length + " conversations) "
    if (fieldsets.length < globalCountLimit) {
        showCountLimit = fieldsets.length;
        performSearch(group,"")
    }
}

function stayAll(group) {
    var radioOptions = document.querySelectorAll('input[id^="' + group + '-"]');
    // Iterate over the radio options and toggle them
    for (var i = 0; i < radioOptions.length; i++) {
        if (!radioOptions[i].disabled && !radioOptions[i].parentNode.parentNode.disabled && radioOptions[i].value == "stay") {
            radioOptions[i].checked = true;
        }
    }
}

function leaveAll(group) {
    var radioOptions = document.querySelectorAll('input[id^="' + group + '-"]');
    // Iterate over the radio options and toggle them
    for (var i = 0; i < radioOptions.length; i++) {
        if (!radioOptions[i].disabled && !radioOptions[i].parentNode.parentNode.disabled && radioOptions[i].value == "leave") {
            radioOptions[i].checked = true;
        }
    }

}

function toggleLeaveStay(group) {
    var radioOptions = document.querySelectorAll('input[id^="' + group + '-"]');
    // Iterate over the radio options and toggle them
    for (var i = 0; i < radioOptions.length; i++) {

        if (!radioOptions[i].disabled && !radioOptions[i].parentNode.parentNode.disabled && radioOptions[i].checked) {
            if (radioOptions[i].value == "stay") {
                radioOptions[++i].checked = true;
                // The below ++i is key to ensure toggle works in a 3 radio option
                ++i;
                if (i >= radioOptions.length) {
                    break;
                }
            }
            if (radioOptions[i].value == "leave") {
                radioOptions[i - 1].checked = true;
            }
        }
    }
}

function cycleOptions(e) {
    pId = e.target.parentNode.id;
    var radioOptions = document.querySelectorAll('input[name^="' + pId + '"]');
    // // Iterate over the radio options and toggle them to the next radio
    for (var i = 0; i < radioOptions.length; i++) {
        c = ((i + 1) % (radioOptions.length))
        if (radioOptions[i].checked) {
            radioOptions[c].checked = true;
            break;
        }
    }

}

function resetToDefault(group) {
    var radioOptions = document.querySelectorAll('input[id^="' + group + '-"]');
    for (var i = 0; i < radioOptions.length; i++) {
        if (radioOptions[i].value == "default") {
            radioOptions[i].checked = true;
        }

    }

}

function nextPage(group) {
    var fieldsets = document.querySelectorAll('fieldset[id^="' + group + '-"]');

    for (var i = 0; i < fieldsets.length; i++) {
        if (fieldsets.length <= showCountLimit) {
            nextPageBtn = document.getElementById(group + "-control-button-nextPage");
            nextPageBtn.disabled = false;
            break;
        }
        if (fieldsets[i].style.display == "block") {
            for (showCount = 0; showCount < showCountLimit; showCount++) {
                instance = showCount + showCountLimit;
                // console.log(i,i+showCount,i+instance,instance);
                if ((i + instance) < fieldsets.length) {

                    fieldsets[i + showCount].style.display = "none";
                    fieldsets[i + showCount].disabled = true;

                    fieldsets[i + instance].style.display = "block";
                    fieldsets[i + instance].disabled = false;

                    prePageBtn = document.getElementById(group + "-control-button-prevPage")
                    prePageBtn.disabled = false;
                    prePageBtn.style.textDecoration = "none";

                } else {
                    nextPageBtn = document.getElementById(group + "-control-button-nextPage")
                    nextPageBtn.disabled = true;
                    nextPageBtn.style.textDecoration = "line-through";
                }
            }
            break;
        }
    }


}

function prevPage(group) {
    var fieldsets = document.querySelectorAll('fieldset[id^="' + group + '-"]');
    for (var i = 0; i < fieldsets.length; i++) {
        if (fieldsets[i].style.display == "block") {
            for (showCount = 0; showCount < showCountLimit; showCount++) {
                instance = showCountLimit - showCount;
                if ((i - instance) >= 0) {
                    fieldsets[i + showCount].style.display = "none";
                    fieldsets[i + showCount].disabled = true;

                    fieldsets[i - (instance)].style.display = "block";
                    fieldsets[i - (instance)].disabled = false;

                    nextPageBtn = document.getElementById(group + "-control-button-nextPage")
                    nextPageBtn.disabled = false;
                    nextPageBtn.style.textDecoration = "none";

                } else {
                    prePageBtn = document.getElementById(group + "-control-button-prevPage")
                    prePageBtn.disabled = true;
                    prePageBtn.style.textDecoration = "line-through";

                }
            }
            break;
        }
    }

}

function performSearch(group, search) {
    var fieldSets = document.querySelectorAll('fieldset[id^="' + group + '-"]');
    // Iterate over the fieldsets
    const pattern = search;
    const regex = new RegExp(pattern, 'g');
    for (var i = 0; i < fieldSets.length; i++) {
        if (search == "") {
            if (i >= showCountLimit) {
                fieldSets[i].style.display = 'none';
                fieldSets[i].disabled = true;
            } else {
                fieldSets[i].style.display = 'block';
                fieldSets[i].disabled = false;
            }

        } else {
            label = fieldSets[i].name;

            const matches = label.match(regex);
            // Check if there were any matches
            if (matches) {
                // Show the matching ones
                fieldSets[i].style.display = 'block';
                fieldSets[i].disabled = false;
            } else {
                // Disable and hide the rest
                fieldSets[i].style.display = 'none';
                fieldSets[i].disabled = true;
            }

        }

    }
    labelSearch = group + '-control-label-'
    controlLabels = document.querySelectorAll(`div[id^="${labelSearch}"]`);

    for (const child of controlLabels) {
        if (search == "") {
            innerHTMLText = showCountLimit;
        } else {
            innerHTMLText = search;
        }
        child.innerHTML = "All " + innerHTMLText;
    }
}

async function is_open(channel, cuid = 0, cl = 0) {
    // return (channel["is_open"] || channel["updated"] > ndaysagots);
    if (channel["is_open"] != undefined) {
        return (channel["is_open"]);
    }
    if (sessionStorage.getItem(channel["id"]) != null) {
        return sessionStorage.getItem(channel["id"]);
    }
    rl = rls.get("tierthree")
    sleep_time = (60 * 1000) / (rl * rl_tolerance);
    await sleep(sleep_time);

    fetchMethod = "POST"
    progressBox = document.getElementById("progress");
    progressBox.innerHTML = "(" + ++cuid + "/" + cl + ") Checking whether conversation is open for " + channel["id"];
    url = slack_base_url + "conversations.info";
    if (formdata.get("channel")) {
        formdata.set("channel", channel["id"]);
    } else {
        formdata.append("channel", channel["id"]);
    }

    response = await fetch(url, {
        method: fetchMethod,
        body: formdata
    });
    data = await response.json();
    if (cuid == cl) {
        progressBox.innerHTML = "";
    }
    sessionStorage.setItem(channel["id"], data["channel"]["is_open"]);
    return data["channel"]["is_open"];
}


async function updateSearchText(controlButton,group,key){
    const pattern = "All";
    const regex = new RegExp(pattern, 'g');
    const matches = key.match(regex);

    // Check if there were any matches
    if (matches) {
        divlabel = " <div id=\"" + group + "-control-label-" + key + "\" class=\"control-button-label\">shown " + showCountLimit + "</div> "
        divContent = divlabel;
    } else {
        divContent = " ";
    }

    innerHTMLText = controlButtonsMap.get(key) + divContent + group;

    controlButton.innerHTML = innerHTMLText;
}