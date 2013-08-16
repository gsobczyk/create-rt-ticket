var initCategories = {
	"categories":[
		{
			"category":"LM",
			"items":[
				{
					"label":"lm24 - Zmiany",
					"data":{
						"queue":33,
						"client":"LeroyMerlin",
						"project":"Aktualizacje",
						"referer":true
					}
				},
				{
					"label":"lm24 - Błąd - Problemy",
					"data":{
						"queue":33,
						"client":"LeroyMerlin",
						"project":"LM-opieka-serwisowa-ecommerce",
						"referer":true
					}
				},
				{
					"label":"LM - Deploy",
					"data":{
						"ownJs":true,
						"js":"tag = prompt('Tag', new Date().format('yyyy-MM-dd'));if (tag) createTicket({queue:'81', klient:'Leroy Merlin', projekt:'Aktualizacje', cc:'lm@unity.pl', content:'Proszę o poranny deploy aplikacji leroymerlin.pl z taga '+tag, subject:'poranny deploy', referer: 'false'})"
					}
				}
			]
		},
		{
			"category":"MIG",
			"items":[
				{
					"label":"MIG - Zmiany",
					"data":{
						"queue":33,
						"client":"MIG",
						"project":"Aktualizacje",
						"cc":"anna.stolarczyk@unity.pl,grzegorz.sobczyk@unity.pl,adrian.adamski@unity.pl",
						"subjectPrefix":"MIG Z#{{ID}}",
						"referer":true
					}
				}
			]
		},
		{
			"category":"Agora",
			"items":[
				{
					"label":"Agora - Aktualizacje",
					"data":{
						"queue":33,
						"client":"Agora",
						"project":"Aktualizacje",
						"subjectPrefix":"Agora m{{ID}}",
						"referer":true
					}
				}
			]
		}
	]
}

function getSettings() {
	var settings = kango.storage.getItem('settings');
	if ($.isEmptyObject(settings)) {
		settings = initSettings();
	}
	return settings;
}
function saveSettings(settings){
	kango.storage.setItem('settings', settings);
}
function findElement(arr, propName, propValue) {
	for (var i=0; i < arr.length; i++)
		if (arr[i][propName] == propValue)
			return arr[i];

// will return undefined if not found; you could return a default instead
}
function initSettings() {
	return initCategories;
}

function deparamHref(url) {
	var pos = url.indexOf('?');
	if (pos < 0) {
		var search = "";
	} else {
		var search = url.split("#")[0].substr(url.indexOf('?') + 1);
	}
	return deparam(search);
}

function getParameterByName(name, url) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	if (results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

var rtCreateUrl = 'https://rt.contium.pl/Ticket/Create.html';

function createTicket(data) {
	kango.browser.tabs.getCurrent(function(tab) {
		var subject;
		if (!$.isEmptyObject(data.subjectPrefix)) {
			subject = data.subjectPrefix + " - ";
		} else {
			subject = data.klient + " - " + data.projekt + " - ";
		}
		if (!$.isEmptyObject(data.subject)) {
			subject += data.subject;
		} else {
			subject += tab.getTitle().replace("#", "");
		}

		var params = deparamHref(tab.getUrl());
		subject = Hogan.compile(subject).render(params);

		var content = subject + " - " + tab.getUrl();
		if (!$.isEmptyObject(data.content)) {
			content = data.content;
		}
		var cc = "";
		if (!$.isEmptyObject(data.cc)) {
			cc = data.cc;
		}
		var refersTo = tab.getUrl();
		if (!$.isEmptyObject(data.referer) && (data.referer == false || data.referer == 'false')) {
			refersTo = "";
		}
		var createUrl = rtCreateUrl+
			"?Queue="+data.queue+
			"&Subject="+encodeURIComponent(subject)+
			"&Cc="+encodeURIComponent(cc)+
			"&new-RefersTo="+encodeURIComponent(refersTo)+
			"&Content="+encodeURIComponent(content)+
			"&Object-RT::Ticket--CustomField-16-Value="+encodeURIComponent(data.klient)+
			"&Object-RT::Ticket--CustomField-21-Value="+encodeURIComponent(data.klient+"/"+data.projekt)+
				// "&Object-RT::Ticket--CustomField-17-Value="+encodeURIComponent(data.rozliczajacy)+
			"&Owner=XXX";
		kango.browser.tabs.create({url: createUrl});
	});
	KangoAPI.closeWindow();
}

Date.prototype.format = function(format) // author: meizz
{
	var o = {
		"M+" : this.getMonth() + 1, // month
		"d+" : this.getDate(), // day
		"h+" : this.getHours(), // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
		"S" : this.getMilliseconds() // millisecond
	}

	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
	return format;
}

$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};