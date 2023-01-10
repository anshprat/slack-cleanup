async function processSlackCleanup() {
    divform = document.getElementById('divform');
    divform.style.display = "none";
    const form = document.getElementById('slack-cleanup-formup');
    const formData = new FormData(form);
    let startTime = performance.now();
    let now = performance.now();
    for (let [key, value] of formData) {
        // console.log(key, value);
        if (key == "stayList" || key == "leaveList") {
            window[key] = value.split(/\r?\n/);
        }

        if (value == "stay") {
            continue;
        }
        channel_id = key.match(/[^-]+$/)[0];
        if (conversation_types.includes(channel_id)) {
            if (default_actions.get(channel_id) != value) {
                default_actions.set(channel_id, value);
                continue;
            }
        }
        ctype = key.match(/^[^-]+/)[0];
        if (value == "default") {
            value = default_actions.get(ctype);

        }
        if (value == "stay") {
            continue;
        }
        if (!conversation_types.includes(ctype)) {
            continue;
        }
        if (value == "leave") {
            chname = (key.match(/-(.*)-/)[1]).replace("-name", "");
            if (stayList.includes(chname)) {
                // conflicting entry in stay list, stay overrides
                continue;
            }
            let wait_time = 1000;

            let formdata = new FormData();
            formdata.append("token", oauthdata);
            formdata.append("channel", channel_id);
            p_ctype = process_leave.get(ctype);
            if (ctype.includes("channel")) {
                url = slack_base_url + "conversations.leave";
                // Rate limits
                // Tier 3
                // Web API Tier 3
                // 50+ per minute
                tier = "tierthree";
                rl = rls.get(tier);

            } else if (ctype.includes("im")) {
                url = slack_base_url + "conversations.close";
                // Rate limits
                // Tier 2
                // Web API Tier 2
                // 20+ per minute
                tier = "tiertwo";
                rl = rls.get(tier);
                // cinforl = 50;
            }
            else {
                p_ctype = p_ctype + 1;
                process_leave.set(ctype, p_ctype);
                wait_time = 1000;
            }
            // console.log(ctype + " " + value, p_ctype);
            // console.log(process_leave);
            // sleep(wait_time).then(() => {
            // console.log("Before fetch", wait_time, ctype, p_ctype, key, value);

            async function leaveCloseConversation() {
                // return;
                processData = document.getElementById('processData');
                // console.log("leaveCloseConversation", console_count, performance.now(), rl, ctype, sleep_time);

                const responsel = await fetch(url, {
                    method: "POST",
                    body: formdata
                });
                const data = await responsel.json();
                if (data.ok) {
                    leave_data = "<br/>left " + key;
                    processData.innerHTML = processData.innerHTML + leave_data;
                    // for (var pair of responsel.headers.entries()) {
                    //     console.log(pair[0] + ': ' + pair[1]);
                    // }

                } else {
                    console.log(data);
                    for (var pair of responsel.headers.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
                    }
                    rla = responsel.headers.get("Retry-After");
                    console.log("retry-after", rla)
                    await sleep(1000 * rla);
                    leaveCloseConversation();
                }
            }

            sleep_time = (60 * 1000) / (rl * rl_tolerance);
            // console.log("before sleep", console_count++, performance.now(), rl, ctype);
            await sleep(sleep_time);
            // console.log("after sleep", console_count, performance.now(), rl, ctype, sleep_time);
            leaveCloseConversation();

            // });

        }

    }
    divform.style.display = "block";
    // console.log(stayList);
    // console.log(leaveList);
}

function addDefaultoptions() {
    // console.log(conversation_types,radios);

    dopts = document.getElementById('defaultOptions');
    for (let r in radios) {
        radio = radios[r];
        if ((radio == "default") || (radio == "leave")) {
            continue;
        }
        stayTextid = radio + "List";
        stayText = document.getElementById(stayTextid);
        if (stayText == null) {
            stayText = document.createElement('textarea');
            stayText.id = stayTextid;
            stayText.name = radio + "List";

            stayTextLabel = document.createElement('label');
            stayTextLabel.htmlFor = stayText;
            stayTextLabel.innerHTML = radio + "List (optional, this has precedence in case of conflicts)";
            dopts.appendChild(stayText);
            dopts.appendChild(stayTextLabel);

        }

    }

    for (let c in conversation_types) {
        ctype = conversation_types[c];
        fsid = "fs-" + ctype;
        // console.log(fsid);
        fs = document.getElementById(fsid);
        if (fs == null) {
            fs = document.createElement('fieldset');
            fs.id = fsid;
            divsf = document.createElement('div');
            divsf.className = "switch-field";
            fs.appendChild(divsf);

            for (let r in radios) {
                radio = radios[r];
                if (radio == "default") {
                    continue;
                }
                elId = ctype + "-" + radio;
                radioButton = document.createElement('input')
                radioButton.type = "radio";
                radioButton.name = "name-default-" + ctype;
                id = "id-default-" + elId;
                radioButton.value = radio;
                radioButton.title = radio;
                radioButton.id = id;
                if (radio == "stay") {
                    radioButton.checked = true;
                }

                rLabel = document.createElement('label');
                rLabel.htmlFor = id;
                rLabel.innerHTML = radio;
                divsf.appendChild(radioButton);
                divsf.appendChild(rLabel);
            }
            typeLabel = document.createElement('label');
            typeLabel.innerHTML = "Default for " + ctype;

            fs.appendChild(typeLabel);
            dopts.appendChild(fs);
        }


    }





}

function enableAll() {
    // Validate the form data
    var fieldSets = document.querySelectorAll('fieldset');
    // Iterate over the fieldsets
    for (var i = 0; i < fieldSets.length; i++) {
        fieldSets[i].disabled = false;
    }
    // return true;  // Return true if the data is valid, false otherwise
    return processSlackCleanup();

}

addDefaultoptions();