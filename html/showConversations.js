
function modalConversations(data) {
    // console.log("modalConversations");
    loadingDiv = document.querySelector('#js-loading');
    processedCount = 1;

    const conversationsContainer = document.querySelector('#conversations-container');

    for (let conversation of data) {
        Total_Conversations++;
        if (processedCount++ >= data.length) {

            // sleep 1 ms for the last option to be in place
            sleep(1).then(() => {
                lastgroup = groups[groups.length - 1];

                for (var group of groups) {
                    countconversations(group);
                }

                if (!searchBoxes.includes(lastgroup)) {
                    addSearchBox(lastgroup);
                    searchBoxes.push(lastgroup);
                }


            });

        } else {
            // loadingDiv.innerHTML = data.length + " conversations found, "+processedCount+" processed in "+groups.length+"groups.";

        }
        setTimeout(() => {
            // console.log(conversation.name);
            if (!groups.includes(conversation.type)) {
                // display the previous block
                if (groups.length) {
                    lastgroup = groups[groups.length - 1]
                    lastgroupDiv = document.getElementById("conversations-type-container-" + lastgroup);
                    lastgroupDiv.style.display = "block";
                    if (!searchBoxes.includes(lastgroup)) {
                        addSearchBox(lastgroup);
                        searchBoxes.push(lastgroup);
                    }


                }
                count_tracker.set(conversation.type,0)
                groupDiv = document.createElement('div');
                groupDiv.className = "group-title";
                groupDiv.id = "conversations-type-container-" + conversation.type;
                groupDivText = document.createElement('div');
                groupDivText.id = "text-" + conversation.type;
                groupDivText.innerHTML = conversation.type;
                groupDiv.appendChild(groupDivText);
                groupDiv.style.display = "none";
                // console.log(groupDiv.id);
                groups.push(conversation.type);
                showCount = 0;
                tabIndex = 1;
                optionElement = document.createElement('div');
                optionElement.id = conversation.type + "-conversations";

            }

            if (optionElement == null) {
                optionElement = document.getElementById(conversation.type + "-conversations")
            }

            ogid = "options-group-" + conversation.type + "-" + conversation.name;
            ogidEl = document.getElementById(ogid);
            if (ogidEl === null) {
                // console.log(ogid,ogidEl);

                const optionsGroup = document.createElement('div');
                optionsGroup.id = ogid;
                fieldset = document.createElement("fieldset");
                fieldset.id = conversation.type + "-" + conversation.name;
                fieldset.name = conversation.name;
                divsf = document.createElement('div');
                divsf.className = "switch-field";
                fieldset.appendChild(divsf);
                for (let choice of radios) {
                    radioButton = document.createElement('input');
                    radioButton.type = "radio";
                    radioButton.name = conversation.type + "-" + conversation.name + "-name-" + conversation.id;
                    radioButton.value = choice;
                    radioButton.title = choice;
                    if (choice == "default") {
                        radioButton.checked = true;
                    };
                    radioButton.id = conversation.type + "-" + conversation.id + "-id-" + choice;
                    radioLabel = document.createElement('label');
                    radioLabel.htmlFor = conversation.type + "-" + conversation.id + "-id-" + choice;
                    radioLabel.innerHTML = choice;
                    divsf.appendChild(radioButton);
                    divsf.appendChild(radioLabel);
                }
                const labelElement = document.createElement('label');
                count_tracker.set(conversation.type, count_tracker.get(conversation.type) + 1);
                labelElement.innerHTML = count_tracker.get(conversation.type) + " " + conversation.name;
                labelElement.htmlFor = fieldset.id;
                labelElement.className = "checkbox-label";
                elId = conversation.type + "-" + conversation.name;
                // console.log(elId);

                labelElement.addEventListener("click", function (e) {
                    cycleOptions(e);
                });
                fieldset.appendChild(labelElement);
                count_tracker_type = count_tracker.get(conversation.type)
                // console.log(count_tracker_type);
                if (count_tracker_type >0 && count_tracker_type <= showCountLimit) {
                    fieldset.style.display = 'block';
                    fieldset.disabled = false;
                } else if (count_tracker_type >0 && count_tracker_type > showCountLimit){
                    fieldset.style.display = 'none';
                    fieldset.disabled = true;
                    
                }

                optionsGroup.appendChild(fieldset);
                roptionElId = optionElement.id;
                eoptionElId = conversation.type + "-conversations";
                if (roptionElId != eoptionElId) {
                    optionElement = document.getElementById(eoptionElId)
                }
                optionElement.appendChild(optionsGroup);
                egroupDivId = 'conversations-type-container-' + conversation.type;
                try {
                    rgroupDivId = groupDiv.id;
                } catch (error) {
                    // console.error(error);
                    groupDiv = document.getElementById(egroupDivId);
                }
                if (rgroupDivId != egroupDivId) {
                    groupDiv = document.getElementById(egroupDivId);
                }
                groupDiv.appendChild(optionElement);
                conversationsContainer.appendChild(groupDiv);
            }


        }, 0);

    }

    loadingDiv.innerHTML = Total_Conversations + " conversations found."

}



async function addSearchBox(group) {
    l_groups = [group];
    for (let group of l_groups) {
        var fieldsets = document.querySelectorAll('fieldset[id^="' + group + '-"]');
        if (fieldsets.length < showCountLimit) {
            showCountLimit = fieldsets.length;
        }

        groupDivId = 'conversations-type-container-' + group;
        groupDiv = document.getElementById(`div[id^="${groupDivId}"]`);
        searchBoxDiv = document.createElement('div');
        searchBoxDiv.id = "search-box-" + group;
        searchBox = document.createElement('input');
        searchBox.type = "text";
        searchBox.placeholder = "Search";
        searchBoxDiv.appendChild(searchBox)


        controlContainer = document.createElement('div');
        controlContainer.className = "control-container";
        controlContainer.id = "control-container-" + group;

        for (const key of controlButtonsMap.keys()) {
            controlButton = document.createElement('button');
            controlButton.type = "button";
            controlButton.className = "control-button";
            controlButton.id = group + "-control-button-" + key;
            // PrevPage is disabled by default
            if (key == "prevPage") {
                controlButton.disabled = true;
                controlButton.style.textDecoration = "line-through";
            };

            if ((key == "nextPage") && (fieldsets.length <= showCountLimit)) {
                controlButton.disabled = true;
                controlButton.style.textDecoration = "line-through";
            };


            controlButton.onclick = function (event) {
                window[key](group);
            };

            // const pattern = "All";
            // const regex = new RegExp(pattern, 'g');
            // const matches = key.match(regex);

            // // Check if there were any matches
            // if (matches) {
            //     divlabel = " <div id=\"" + group + "-control-label-" + key + "\" class=\"control-button-label\">shown " + showCountLimit + "</div> "
            //     divContent = divlabel;
            // } else {
            //     divContent = " ";
            // }

            // innerHTMLText = controlButtonsMap.get(key) + divContent + group;

            // controlButton.innerHTML = innerHTMLText;
            updateSearchText(controlButton,group,key)
            controlContainer.appendChild(controlButton);
        }

        groupOptionsDiv = document.getElementById("conversations-type-container-" + group);
        firstEl = groupOptionsDiv.firstChild;
        firstEl.parentNode.style.display = "block";
        groupOptionsDiv.insertBefore(controlContainer, firstEl);
        groupOptionsDiv.insertBefore(searchBoxDiv, firstEl);

        searchBox.addEventListener('input', (event) => {
            // Get the current value of the search input field
            const searchValue = event.target.value;
            // Perform the search using the search value
            performSearch(group, searchValue);
        });

    }
}

function listConversationOptions() {
    // let conversation_types = ["public_channel", "private_channel", "mpim", "im"];
    divconversationTypes = document.getElementById("conversationTypes");

    // <label class="toggler-wrapper style-28">
    //       <input type="checkbox" >
    //       <div class="toggler-slider">
    //         <div class="toggler-knob"></div>
    //       </div>
    //     </label>

    for (let c in conversation_opts) {
        ctype = conversation_opts[c];
        // console.log(ctype);
        cbolabel = document.createElement('label');
        cbolabel.className = "toggler-wrapper style-28";
        // divconversationTypes.appendChild(cbolabel);

        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "conversation-type-opts-" + ctype;
        checkbox.name = ctype;
        checkbox.value = ctype;

        cbLabel = document.createElement("label");
        cbLabel.htmlFor = checkbox.id;
        cbLabel.innerHTML = ctype;

        if (conversation_types.includes(ctype)) {
            checkbox.checked = true;
        }

        divconversationTypes.appendChild(checkbox);
        divconversationTypes.appendChild(cbLabel);

        divtogglerslide = document.createElement('div');
        divtogglerslide.className = "toggler-slider"
        divtogglerknob = document.createElement('div');
        divtogglerknob.className = "toggler-knob"
        // divtogglerslide.appendChild(divtogglerknob);
        // cbolabel
        // cbolabel.appendChild(divtogglerslide);


    }

    getConversationsButton = document.createElement("button");
    getConversationsButton.value = "getConversations";
    getConversationsButton.type = "button";
    getConversationsButton.className = "getConversations";
    getConversationsButton.id = "getConversations";
    getConversationsButton.innerHTML = "Get Conversations"
    divconversationTypes.appendChild(getConversationsButton);

    getConversationsButton.addEventListener('click', function () {
        processconversation_opts();
    });


}

function processconversation_opts() {
    // console.log(e);
    divconversationTypes = document.querySelectorAll('input[id^="conversation-type-opts-"]')
    conversation_types.length = 0;
    for (var i = 0; i < divconversationTypes.length; i++) {
        if (divconversationTypes[i].checked) {
            conversation_types.push(divconversationTypes[i].value);
        }
    }
    // console.log(conversation_types);
    getConversations();
    // console.log(divconversationTypes);

}

listConversationOptions();