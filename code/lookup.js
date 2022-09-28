var app = document.createElement("app")
document.body.appendChild(app)

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea")
    textArea.style.position = 'fixed'
    textArea.style.top = 0
    textArea.style.left = 0
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = 0
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    var success = "what"
    try {
      var successful = document.execCommand('copy')
      success = successful
    } catch (err) {
        success = 'Oops, unable to copy'
    }
    document.body.removeChild(textArea)
    return success
}

function initApp(){
    app.innerHTML = "<header><h1>Lookup</h1><p class='btn'><i class='m-i'>account_circle</i> Account</p><p class='btn'><i class='m-i'>settings</i> Settings</p></header>"
    var miniwindow = document.createElement("div")
    app.appendChild(miniwindow)
    miniwindow.classList.add("miniwindow")
    function showMiniWindow(html){
        miniwindow.innerHTML = html
        miniwindow.classList.add("miniwindowactive")
        return miniwindow.getElementsByTagName("p")
    }
    document.addEventListener("click", function(e){
        if(miniwindow.classList[1]=="miniwindowactive" && e.target!=settingsbtn && e.target!=accountbtn && e.target!=miniwindow){
            miniwindow.classList.remove("miniwindowactive")
            accountbtn.classList.remove("pactive")
            settingsbtn.classList.remove("pactive")
        }
    })

    var accountbtn = app.getElementsByTagName("p")[0]
    var settingsbtn = app.getElementsByTagName("p")[1]
    ButtonEvent(accountbtn, function(){
        accountbtn.classList.add("pactive")
        settingsbtn.classList.remove("pactive")
        showMiniWindow("<a>Account</a><p>Account features not coming soon.</p>")
        // setTimeout(() => {
        //     accountbtn.classList.remove("pactive")
        // }, 100) click style cancelled!
    })
    ButtonEvent(settingsbtn, function(){
        settingsbtn.classList.add("pactive")
        accountbtn.classList.remove("pactive")
        var themebtn = "<p><i class='m-i'>nights_stay</i>Dark Theme</p>"
        if(document.getElementById("dark")){
            themebtn = "<p><i class='m-i'>light_mode</i>Light Theme</p>"
        }
        var languagebtn = "<p><i class='m-i'>translate</i>Language</p>" //scrapped for now cuz lazy
        var buttons = showMiniWindow("<a>Settings</a>"+themebtn)
        ButtonEvent(buttons[0], function(){
            var dark = document.getElementById("dark")
            if(dark){
                dark.remove()
            }
            else{
                loadCSS("style/dark.css", "dark")
            }
        })
    })

    function changePending(html){
        pending.innerHTML = html
        pending.classList.add("pactive")
    }

    var lastname = ""
    function Search(){
        var name = search.value
        if(name==""){
            changePending("Cannot be empty.")
            return
        }
        if(name==lastname){
            changePending("Cannot be the same as last.")
            return
        }
        lastname = name

        changePending("Connecting...")

        var data = {search : name}
        $.ajax({
            url: "app/search.php",
            type: "post",
            data: data,
            timeout: 1500,
            success: function(){
                changePending("Processing...")
            },
            complete: function (response) {
                response = response.responseText
                try {
                    response = JSON.parse(response)
                } catch (err) {
                    changePending("Server returned invalid data.")
                    return
                }
                if(response.status=="success"){
                    add(response)
                    changePending("Completed!")
                    setTimeout(() => {
                        pending.classList.remove("pactive")
                    }, 500)
                }
                else{
                    if(response.status=="matchfailure"){
                        changePending("Your input doesn't look like a domain or an IP.")
                    }
                }
            },
            error: function() {
                changePending("Error connecting. Check your internet connection.")
            }
        })
        
    }

    var searchdiv = document.createElement("div")
    searchdiv.classList.add("search")
    var search = document.createElement("input")
    search.placeholder = "Search for any domain or IP address"
    search.addEventListener("input", function(){
        pending.classList.remove("pactive")
    })
    search.addEventListener("keydown", function(e){
        if(e.key=="Enter"){
            Search()
        }
    })
    var searchbtn = document.createElement("button")
    searchbtn.classList.add("m-i")
    searchbtn.innerText = "search"
    ButtonEvent(searchbtn, function(){
        Search()
    })
    var pending = document.createElement("p")

    searchdiv.appendChild(search)
    searchdiv.appendChild(searchbtn)
    searchdiv.appendChild(pending)
    app.appendChild(searchdiv)

    var logs = document.createElement("div")
    logs.classList.add("logs")
    app.appendChild(logs)

    function add(data){
        var datalog = document.createElement("div")
        datalog.innerHTML = "<a>"+data.ip+"</a><p class='btn'><i class='m-i'>content_copy</i> Copy</p><p class='btn'><i class='m-i'>remove</i> Remove</p>"

        parser = new DOMParser()
        xmlDoc = parser.parseFromString(data.dnsinfo, "text/xml")


        var dataerror = xmlDoc.getElementsByTagName("dataError")[0]
        if(dataerror){
            datalog.innerHTML += "<p class='err'>"+dataerror.innerHTML+"</p>"
        }

        datalog.innerHTML +="<p>"+data.dnsinfo+"</p>"

        var actions = datalog.getElementsByTagName("p")


        ButtonEvent(actions[0], function(){
            copyTextToClipboard(data.dnsinfo)
        })
        ButtonEvent(actions[1], function(){
            datalog.remove()
        })

        // ButtonEvent(datalog, function(){
        //     datalog.classList.add("active")
        // }) scrapped idea
        logs.appendChild(datalog)
    }
}

initApp()