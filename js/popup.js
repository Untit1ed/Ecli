(function (PopUp) {
	// Add event listeners once the DOM has fully loaded by listening for the
	// `DOMContentLoaded` event on the document, and adding your listeners to
	// specific elements when it triggers.
	document.addEventListener('DOMContentLoaded', function () {
		var bg = chrome.extension.getBackgroundPage().Ecli.backGround;
		bg.resetUnreadCounter();

		var login = bg.getLogin();
		console.log(login);

    	document.getElementById(login ? 'page2' : 'page1').style.display = "block";

		var storedRecords = bg.getRecords();
		console.log(bg.getRecords());
		storedRecords.forEach(function(record) {
			PopUp.insertNewRecord(record);
		});

		document.getElementById('options').addEventListener('click', function (e) {
			e.preventDefault();

			bg.openOptions();
		}, false);
	});

	PopUp.unauth = function () {
		
	};

	PopUp.insertNewRecord = function (record, prepend) {
		var link = document.createElement("a");
		link.href = record.link;
		link.target = '_blank';
		link.className = 'branch-ref css-truncate css-truncate-target';
		link.setAttribute('title', record.title + "\r\n" + record.link);


		var iconUrl = 'http://www.google.com/s2/favicons?domain=' + url_domain(record.link);
		var favicon = document.createElement("img");
		favicon.src = iconUrl;
		link.appendChild(favicon);

		var linkText = document.createElement("span");
		linkText.innerText = record.title;
		link.appendChild(linkText);

		var created = document.createElement("time");
		created.setAttribute('dateTime', record.addedOn);
		created.className = 'counter';
		getFriendlyDate(created, record.addedOn);

		var author = document.createElement("span");
		author.title = record.sentFrom;
		if (record.sentFrom === "Browser") {
			author.className = 'fa fa-desktop';
		} else {
			author.className = 'fa fa-mobile';
		}

		var authorContainer = document.createElement("span")
		authorContainer.className = 'author'
		authorContainer.appendChild(author);

		var li = document.createElement("li");
		li.appendChild(link);
		li.appendChild(authorContainer);
		li.appendChild(created);

		var ul = document.getElementById('history');
		if (ul) {
			if (prepend)
				ul.insertBefore(li, ul.firstChild);
			else
				ul.appendChild(li);

			// force style rendering
			window.getComputedStyle(li).getPropertyValue("top");
			li.className = 'menu-item';
		}
	};

	var getFriendlyDate = function (el, date) {
		el.innerHTML = window.moment(date).fromNow();

		setTimeout(function () { getFriendlyDate(el, date); }, 1000);
	};

	function url_domain(data) {
		var a = document.createElement('a');
		a.href = data;
		return a.hostname;
	}

}(window.PopUp = window.PopUp || {}));