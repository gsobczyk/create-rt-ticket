function deparamHref(url){
	var pos = url.indexOf('?');
	if (pos<0){
		var search = "";
	} else {
		var search = url.split("#")[0].substr(url.indexOf('?')+1);
	}
	return deparam(search);
}

function getParameterByName(name, url) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec(url);
	if( results == null )
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

var rtCreateUrl = 'https://rt.contium.pl/Ticket/Create.html';

function createTicket(data){
	kango.browser.tabs.getCurrent(function(tab) {
		var subject;
		if (data.subjectPrefix){
			subject = data.subjectPrefix  + " - ";
		} else {
			subject = data.klient + " - " + data.projekt + " - ";
		}
		if (data.subject != undefined){
			subject += data.subject;
		} else {
			subject += tab.getTitle().replace("#", "");
		}
		
		var params = deparamHref(tab.getUrl());
		subject = Hogan.compile(subject).render(params);
		
		var content = subject +" - "+tab.getUrl();
		if (data.content != undefined){
			content = data.content;
		}
		var cc="";
		if (data.cc != undefined){
			cc = data.cc;
		}
		var refersTo = tab.getUrl();
		if (data.refers != undefined && data.refers==false){
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
		//"&Object-RT::Ticket--CustomField-17-Value="+encodeURIComponent(data.rozliczajacy)+
		"&Owner=XXX";
		kango.browser.tabs.create({url: createUrl});
	});
	KangoAPI.closeWindow();
}

Date.prototype.format = function(format) //author: meizz
{
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }

  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}