var initialCategories = [
	{
		"category":"LM",
		"items":[
			{
				"label":"lm24 - Zmiany",
				"data":{
					"queue":33,
					"client":"Leroy Merlin",
					"project":"Aktualizacje",
					"referer":true,
					"addOwner":true,
					"subjectPrefix":"LM",
					"remove":" - Unity - Extranet Leroy Merlin"
				}
			},
			{
				"label":"lm24 - Błąd - Problemy",
				"data":{
					"queue":33,
					"client":"Leroy Merlin",
					"project":"LM-opieka-serwisowa-ecommerce",
					"referer":true,
					"addOwner":true,
					"subjectPrefix":"LM",
					"remove":" - Unity - Extranet Leroy Merlin"
				}
			},
			{
				"label":"LM - Deploy",
				"data":{
					"ownJs":true,
					"js":"tag = prompt('Tag', $.formatDateTime('yy-mm-dd', new Date())); if (tag) createTicket({queue:'81', klient:'Leroy Merlin', projekt:'Aktualizacje', cc:'lm@unity.pl', content:'Proszę o poranny deploy aplikacji leroymerlin.pl z taga '+tag, subject:'poranny deploy', referer: 'false'})"
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
					"referer":true,
					"addOwner":true
				}
			},
			{
				"label":"MIG - Deploy",
				"data":{
					"ownJs":true,
					"js":"tag = prompt('Tag', 'PROD_'+$.formatDateTime('yy-mm-dd', new Date()));if (tag) createTicket({queue:'81', klient:'MIG', projekt:'MIG-opieka-serwisowa', cc:'anna.stolarczyk@unity.pl,grzegorz.sobczyk@unity.pl,adrian.adamski@unity.pl', content:'Proszę o poranny deploy wszystkich aplikacji MIG\\\'a z taga '+tag, subject:'poranny deploy', refers: false})"
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
					"referer":true,
					"addOwner":true
				}
			}
		]
	}
];


function getSettings() {
	var settings = kango.storage.getItem('settings');
	if ($.isEmptyObject(settings)) {
		settings = {};
		initialCategories;
	}
	if ($.isEmptyObject(settings.categories)) {
		settings.categories = initialCategories;
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
		subject = subject.replace(data.remove, '');

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
		var owner = "XXX";
		if (!$.isEmptyObject(data.addOwner) && (data.addOwner == true || data.addOwner == 'true')) {
			owner = getSettings().owner;
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
			"&Owner="+owner;
		kango.browser.tabs.create({url: createUrl});
	});
	KangoAPI.closeWindow();
}

(function( $ ) {
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
}( jQuery ));

function initPopupTree() {
  var template = $('#tree-template').html();
  var settings = getSettings();
  var compiled = Hogan.compile(template).render(settings);
  $('#tree').html(compiled);
  $('button.action').click(function (){
    var onclick = $(this).data('onclick');
    eval(onclick);
  });
}


function initOptionsTree() {
  var template = $('#tree-template').html();
  var settings = getSettings();
  var compiled = Hogan.compile(template).render(settings);
  $('#tree').html(compiled);
  $('button.action').click(function (){
    var onclick = $(this).data('onclick');
    eval(onclick);
  });
}
function addCategory() {
  var settings = getSettings();
  var category = prompt('Kategoria');
  if (!$.isEmptyObject(category)) {
    var addedCategory = findElement(settings.categories, "category", category);
    if ($.isEmptyObject(addedCategory)){
      addedCategory = {"category":category, data:[]};
      settings.categories.push(addedCategory);
      saveSettings(settings);
    }
  }
  initOptionsTree();
  return addedCategory;
}
function removeCategory(category) {
  var settings = getSettings();
  var cat = findElement(settings.categories, "category", category)
  var idx = settings.categories.indexOf(cat);
  settings.categories.splice(idx, 1);
  saveSettings(settings);
  initOptionsTree();
}
function addItemForCategory(category){
  $('#category').val(category);
  $('#addItem').show();
}
function addItem(){
  var form = $('form').serializeObject();
  var settings = getSettings();
  var cat = findElement(settings.categories, "category", form.category)
  var label = form.label;
  delete form.category;
  delete form.label;
  var existed = findElement(cat.items, "label", label)
  if (!$.isEmptyObject(existed)){
	  delete existed.data.ownJs;
	  delete existed.data.referer;
	  delete existed.data.addOwner;
	  $.extend(existed.data, form)
  } else {
	  cat.items.push({"label":label, "data":form});
  }
  saveSettings(settings);
  $('#addItem').hide();
  initOptionsTree();
  return false;
}
function removeItem(category, label) {
  var settings = getSettings();
  var cat = findElement(settings.categories, "category", category)
  var item = findElement(cat.items, "label", label)
  cat.items.splice(item, 1);
  saveSettings(settings);
  initOptionsTree();
}
function editItem(category, label) {
  var settings = getSettings();
  var cat = findElement(settings.categories, "category", category)
  var item = findElement(cat.items, "label", label)
  $('#category').val(category);
  $('#label').val(item.label);
  $('#ownJs').prop('checked', item.data.ownJs);
  $('#js').val(item.data.js);
  $('#queue').val(item.data.queue);
  $('#client').val(item.data.client);
  $('#project').val(item.data.project);
  $('#cc').val(item.data.cc);
  $('#subject').val(item.data.subject);
  $('#content').val(item.data.content);
  $('#referer').prop('checked', item.data.referer);
  $('#addOwner').prop('checked', item.data.addOwner);
  $('#subjectPrefix').val(item.data.subjectPrefix);
  $('#remove').val(item.data.remove);
  $('#addItem').show();
}
function resetCategories(){
  var settings = getSettings();
  settings.categories = initialCategories;
  saveSettings(settings);
  initOptionsTree();
}
function saveOwner(){
  var owner = $('#ownerId').val();
  var settings = getSettings();
  settings.owner = owner;
  saveSettings(settings);
  initOptionsTree();
}