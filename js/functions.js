//functions.js

// constants
var kAdminPass = "pr1v@te";
var kStaffPass = "cacpsstaff";
var kMaxStatus = 20;
var kKudoScore = 1;
var kDeltaScore = 1;
var kMinStatus = 0;
var kStartStatus = 5;

$(document).on('mobileinit', function () {
	//set global options here
	$.mobile.defaultPageTransition = "slide";

});

function goToPage(targetPage, doReverse) {
	if ((typeof doReverse) == "undefined") {
		doReverse = false;
	}
	$(":mobile-pagecontainer").pagecontainer('change', targetPage, {
		transition: "slide",
		reverse: doReverse
	});
	console.log('goTo ' + targetPage);
}

function initialize(pageID) {

	switch (pageID) {
	case 'login':
		console.log('initialize login');
		localStorage.currStaffName = "";
		localStorage.currStaffID = "";
		$('#password').val('');
		getTermList(true);
		//sets termList, never changes, creates menu, sets currDB
		getStaffList(true, 0);
		//sets staffList, depends only on currDB, includes createStaffMenu
		getDeltaList();
		//sets deltaList, depends only on currDB, no menu created
		getCrewList();
		//sets crewList, depends only on currDB, no menu created
		getStudentList("nomenu");
		//sets studentList, depends only on currDB
		getTimeZero();
		//sets timeZero, depends only on currDB
		// prevent submit from return in form text field with class .noSubmit
		$("input.noSubmit").keypress(function (event) {
			var k = event.keyCode || event.which;
			if (k == 13) {
				event.preventDefault();
				event.stopImmediatePropagation();
				$('#loginButton').trigger('click');
			}
		});
		// term selection change
		$("#termSelect").on('change', function (event) {
			console.log(event);
			event.preventDefault();
			event.stopImmediatePropagation();
			localStorage.currDBName = $('#termSelect option:selected').text();
			localStorage.currDB = dbText(localStorage.currDBName);
			//resets currDB
			getStaffList(true, 0);
			//resets staffList, menu
			getStudentList("nomenu");
			//resets studentList
			getDeltaList();
			//resets deltaList, no menu created
			getCrewList();
			//resets crewList, does not create menu
			getTimeZero();
			//resets timeZero
		});
		$('#staffMenu0').on('change', function (event) {
			event.stopImmediatePropagation();
			localStorage.currStaffName = $('#staffMenu0 option:selected').text();
			//sets currStaffName
			localStorage.currStaffID = $('#staffMenu0 option:selected').val();
			//sets currStaffID
		});
		// login button click
		$('#loginButton').on('click', function (event) {
			console.log(event);
			event.preventDefault();
			event.stopImmediatePropagation();
			if (checkLogin()) {
				$('#staffMenu0-dialog').remove();
				//prevent dialog from sticking around
				$('#password').val('');
				$('#staffMenu0').prop('selectedIndex', 0);
				//allow re-initialize on return
				goToPage('mainmenu.html');
			}
		});
		// loginErr close button click
		$('#loginErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#password').val('');
			$('#loginErr').popup('close');
			setTimeout(function () {
				$('#loginButton').removeClass('ui-btn-active');
			}, 200);
		});
		// noStaffErr close button click
		$('#noStaffErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#noStaffErr').popup('close');
			$('#password').val('');
			setTimeout(function () {
				$('#loginButton').removeClass('ui-btn-active');
			}, 200);
		});
		break;
	case 'mainmenu':
		if (!checkValidUser()) {
			$('p#infoStrip').text("Error");
			return;
		}
		console.log('mainmenu initialize');
		$('p#infoStrip').text(localStorage.currDBName + " | " + localStorage.currStaffName);
		$('#dataSelect').selectmenu();
		$('#dataSelect').prop('selectedIndex', 0);
		$('#dataSelect').selectmenu('refresh', true);
		$('#reportSelect').selectmenu();
		$('#reportSelect').prop('selectedIndex', 0);
		$('#reportSelect').selectmenu('refresh', true);

		if (localStorage.isAdmin == "false") {
			$('#adminButton').hide();
		} else {
			$('#adminButton').show();
		}
		getKudoList();
		//need early for enterkudos
		localStorage.currStudent = '';
		//clears currStudent, currStudentID
		localStorage.currStudentID = '';
		//in case have just looked at a student's record
		$("#dataSelect").on('change', function (event) {
			event.stopImmediatePropagation();
			var target = $('#dataSelect option:selected').val();
			goToPage(target);
		});
		$("#reportSelect").on('change', function (event) {
			event.stopImmediatePropagation();
			var target = $('#reportSelect option:selected').val();
			setTimeout(function () {
				goToPage(target);
			}, 500);
		});
		break;
	case 'schoolstatus':
		console.log('schoolstatus initialize');
		var currDB = localStorage.currDB;
		$('p#infoStrip').text(localStorage.currDBName);
		$('a#optionname').trigger('click');
		$('#listOptions li').click(function (event) {
			var choice = $(this).text().trim();
			console.log(choice.length);
			event.preventDefault();
			event.stopImmediatePropagation();
			switch (choice) {
			case "Name":
				var url = "php/status_access?access_op=byname&db_name=" + currDB + "&op_data=0";
				$.get(url, function (data) {
					$('#contentSpace').html(data);
				});
				break;
			case "Status":
				var url = "php/status_access?access_op=bystatus&db_name=" + currDB + "&op_data=0";
				$.get(url, function (data) {
					$('#contentSpace').html(data);
				});
				break;
			case "Crew":
				var url = "php/status_access?access_op=bycrew&db_name=" + currDB + "&op_data=0";
				$.get(url, function (data) {
					$('#contentSpace').html(data);
				});
				break;
			case "Gender":
				var url = "php/status_access?access_op=bygender&db_name=" + currDB + "&op_data=0";
				$.get(url, function (data) {
					$('#contentSpace').html(data);
				});
				break;
			case "Class":
				var url = "php/status_access?access_op=byclass&db_name=" + currDB + "&op_data=0";
				$.get(url, function (data) {
					$('#contentSpace').html(data);
				});
				break;
			}
		});
		break;
	case 'studentreports':
		console.log('studentreports initialize');
		$('p#infoStrip').text(localStorage.currDBName);
		//show record select menu if a student is already chosen
		if (localStorage.currStudent !== '') {
			$('div.ui-input-search input').val(localStorage.currStudent);
			$('ul#studentSelect li').addClass('ui-screen-hidden');
			$('#recordMenu').popup('open');
		} else {
			createStudentListMenu();
		}
		// set up select action of student menu
		$('ul#studentSelect').on("click", "li", function (event) {
			localStorage.currStudent = $(this).text();
			//sets currStudent
			localStorage.currStudentID = $(this).val();
			//sets currStudentID
			$('div.ui-input-search input').val($(this).text());
			$('ul#studentSelect li').addClass('ui-screen-hidden');
			$('#recordMenu').popup('open');
			getStudentEventList();
			getDeltaEventList();
			$('#menuItems a').removeClass('ui-btn-active');
		});
		// set up action of popup menu
		$('#recordMenu a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			var target = ($(this).attr('href'));
			switch (target) {
			case "studentreports.html":
				localStorage.currStudent = '';
				//clears currStudent for selection of new student
				localStorage.currStudentID = '';
				//clears currStudent ID
				$('div#studentreports').remove();
				goToPage("studentreports.html");
				break;
			case "statusgraph.html":
				// getStudentEventList();
				goToPage("statusgraph.html");
				break;
			case "studentevents.html":
				goToPage("studentevents.html");
				break;
			case "deltaprofile.html":
				goToPage('deltaprofile.html');
				break;
			case "mainmenu.html":
				goToPage('mainmenu.html', true);
				//reverse direction
				break;
			}
		});
		break;
	case 'studentevents':
		console.log('student events initialized');
		$('p#infoStrip').text(localStorage.currDBName);
		$('div#studentNameHeader').html("<strong>" + localStorage.currStudent + "</strong> &nbsp;<em>" + localStorage.numStudentEvents + " events</em>");
		studentEventTable();
		break;
	case 'graphpage':
		console.log('statusgraph initialized');
		var numPoints = parseInt(localStorage.numStudentEvents);
		$('p#infoStrip').text(localStorage.currDBName);
		var style = 'height: ' + ($(window).height() - 120) + 'px; width: ' + ($(window).width() - 10) + 'px; margin: auto;';
		//var style = 'height: ' + ($( window ).height() - 90) + 'px; width: ' + ($( window ).width() - 15) + 'px; margin: auto;';
		$('div#graphcontainer').attr('style', style);
		$('div#graphcontainer').html('');
		$('div#studentNameHeader').html("<strong>" + localStorage.currStudent + "</strong> &nbsp;&nbsp;<em>Status: " + statusFromLastEvent() + "</em>");
		if (numPoints < 2) {
			$('div#tooFew p').text("The graph requires at least two events on different days. This student doesn't have them.");
			$('#tooFew').popup('open');
		} else {
			studentStatusGraph();
		}
		// tooFew close button click
		$('#tooFew a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#backButton').trigger('click');
			//click gets registered as menu request previous page
		});
		break;
	case 'chartpage':
		console.log('chartpage initialized');
		$('p#infoStrip').text(localStorage.currDBName);
		var style = 'height: ' + ($(window).height() - 120) + 'px; width: ' + ($(window).width() - 10) + 'px; margin: auto;';
		$('div#graphcontainer').attr('style', style);
		$('div#graphcontainer').html('');
		$('div#studentNameHeader').html("<strong>" + localStorage.currStudent + "</strong>&nbsp;&nbsp;<em>" + localStorage.numDeltaEvents + " deltas</em>");
		if (localStorage.numDeltaEvents == "0") {
			$('#noDeltas').popup('open');
		} else {
			studentDeltaChart();
		}
		$('#noDeltas a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#backButton').trigger('click');
		});
		break;
	case 'staffselect':
		console.log('staffselect initialized');
		$('p#infoStrip').text(localStorage.currDBName);
		createStaffMenu(1);
		$('#staffMenu1').on('change', function (event) {
			event.stopImmediatePropagation();
			//needed to prevent bouncing due to multiple pending events
			localStorage.currViewStaffName = $('#staffMenu1 option:selected').text();
			//sets currViewStaffName
			localStorage.currViewStaffID = $('#staffMenu1 option:selected').val();
			//sets currViewStaffID
			$('#staffMenu1').prop('selectedIndex', 0);
			//indicate this is a fresh menu on return to page
			getStaffEventList(localStorage.currViewStaffID);
			setTimeout(function () {
				goToPage('staffevents.html');
			}, 500);
		});
		break;
	case 'staffevents':
		console.log('staffevents initialized');
		$('p#infoStrip').text(localStorage.currDBName);
		$('div#staffNameHeader').html("<strong>" + localStorage.currViewStaffName + "</strong> &nbsp;<em>" + localStorage.numStaffEvents + ' events</em>');
		staffEventTable();
		break;
	case 'enterdeltas':
		console.log('enterdeltas initialized');
		$('p#infoStrip').text(localStorage.currDBName + " | " + localStorage.currStaffName);
		var now = new Date();
		var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
		$('#deltaDateInput').val(dateStr);
		$('#deltaDateInput').click(function (event) {
			$('#deltaDateInput').datebox({
				mode: "calbox",
				themeHeader: "c",
				themeDate: "a",
				themeDateToday: "a"
			});
			$('#deltaDateInput').datebox('refresh');
		});

		createDeltaMenu();
		getStudentList("selectmenu");
		//ensure status values up to date
		$('#deltaComment').val('');
		$('#submitDeltas').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			console.log('post clicked');
			postStudentDeltas();
		});
		// notValidDate close button click
		$('#notValidDate a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#notValidDate').popup('close');
			setTimeout(function () {
				$('#submitDeltas').removeClass('ui-btn-active');
			}, 200);
		});
		// noStudentErr close button click
		$('#noStudentErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#noStudentErr').popup('close');
			setTimeout(function () {
				$('#submitDeltas').removeClass('ui-btn-active');
			}, 200);
		});
		// noDeltaErr close button click
		$('#noDeltaErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#noDeltaErr').popup('close');
			setTimeout(function () {
				$('#submitDeltas').removeClass('ui-btn-active');
			}, 200);
		});
		// postOK close button click
		$('#postOK a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#postOK').popup('close');
			createDeltaMenu();
			//clear delta choices
			createStudentMenu();
			//clear student choices
			('#deltaComment').val('');
		});
		// backButton click - clear menu choices
		$('a#backButton').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			console.log('backbutton clicked');
			$('#deltaComment').val('');
			createDeltaMenu();
			createStudentMenu();
			goToPage("mainmenu.html", true);
		});
		break;
	case 'enterkudos':
		console.log('enterkudos initialized');
		$('p#infoStrip').text(localStorage.currDBName + " | " + localStorage.currStaffName);
		var now = new Date();
		var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
		$('#kudoDateInput').val(dateStr);
		$('#kudoDateInput').click(function (event) {
			$('#kudoDateInput').datebox({
				mode: "calbox",
				themeHeader: "c",
				themeDate: "a",
				themeDateToday: "a"
			});
			$('#kudoDateInput').datebox('refresh');
		});

		createKudoMenu();
		getStudentList("selectmenu");
		//ensure status values up to date
		$('#kudoComment').val('');

		$('#submitKudos').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			console.log('post clicked');
			postStudentKudos();
		});
		// notValidDate close button click
		$('#notValidDate a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#notValidDate').popup('close');
			setTimeout(function () {
				$('#submitKudos').removeClass('ui-btn-active');
			}, 200);
		});
		// noStudentErr close button click
		$('#noStudentErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#noStudentErr').popup('close');
			setTimeout(function () {
				$('#submitKudos').removeClass('ui-btn-active');
			}, 200);
		});
		// noKudoErr close button click
		$('#noKudoErr a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#noKudoErr').popup('close');
			setTimeout(function () {
				$('#submitKudos').removeClass('ui-btn-active');
			}, 200);
		});
		// postOK close button click
		$('#postOK a').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#postOK').popup('close');
			createKudoMenu();
			//clear kudo choices
			createStudentMenu();
			//clear student choices
			$('#kudoComment').val('');
		});
		// backButton click - clear menu choices
		$('a#backButton').click(function (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			console.log('backbutton clicked');
			$('#kudoComment').val('');
			createKudoMenu();
			createStudentMenu();
			goToPage("mainmenu.html", true);
		});
		break;
		/*
	 case 'adminmenu':
	 console.log('adminmenu initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editclasslist':
	 console.log('editclasslist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editcrewlist':
	 console.log('editcrewlist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editstafflist':
	 console.log('editstafflist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editstudentdata':
	 console.log('editstudentdata initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'updatestudentlist':
	 console.log('updatestudentlist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editdeltalist':
	 console.log('editdeltalist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'editkudolist':
	 console.log('editkudolist initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 case 'emailstudentreports':
	 console.log('emailstudentreports initialized');
	 $('p#infoStrip').text( localStorage.currDBName + " | " + localStorage.currStaffName );
	 break;
	 */
	default:
		console.log('no initialization for this page');
	}
}

function getTermList(doMenu) {
	localStorage.termList = "";
	var db;
	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "term",
			db_name: "status000",
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		var termList = '[';
		$.each(data.list, function (i, dat) {
			var str = dat.Database;
			if (str.match("status") && !str.match('x') && !str.match('00') && isNewTerm(str)) {
				termList += '{"Database":"' + str + '"},';
				db = str;
			}
		});
		// had to get currDB now because it can take too long to do it in createTermMenu; then staffMenu fails in index.html
		localStorage.currDB = db;
		termList = termList.substr(0, termList.length - 1);
		//trim last ','
		termList += ']';
		localStorage.termList = termList;
		if (doMenu) {
			createTermMenu();
		}
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert('termList is ' + localStorage.termList);
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function isNewTerm(dbName) {
	var dbTerm = parseInt(dbName.substr(6));
	return (dbTerm > 140);
}

function createTermMenu() {
	var menuList = JSON.parse(localStorage.termList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, dat) {
		var str = dat.Database;
		optionList += '<option>' + "Term " + str.substr(8, 1) + " of 20" + str.substr(6, 2) + '</option>';
	});
	$('#termSelect').html(optionList);
	$('#termSelect').selectmenu();
	var lastOptionIndex = menuList.length;
	//there's a placeholder
	$('#termSelect').prop('selectedIndex', lastOptionIndex);
	localStorage.currDBName = $('#termSelect option:eq(-1)').text();
	$('#termSelect').selectmenu('refresh');
}

function getStaffList(doMenu, index) {
	var currDB = localStorage.currDB;
	localStorage.currStaffName = '';
	localStorage.currStaffID = '';
	localStorage.staffList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "staff",
			db_name: currDB,
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		localStorage.staffList = JSON.stringify(data.list);
		if (doMenu) {
			createStaffMenu(index);
		}
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function createStaffMenu(index) {
	console.log('create staff menu');
	var menuList = JSON.parse(localStorage.staffList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, dat) {
		optionList += '<option value="' + dat.ID + '">' + dat.lastName + ', ' + dat.firstName + '</option>';
	});
	var theMenu = $('#staffMenu0');
	if (index == 1) {
		theMenu = $('#staffMenu1');
	}
	theMenu.html(optionList);
	theMenu.selectmenu();
	theMenu.selectmenu('refresh', true);
	//forces rebuild
}

function getCrewList() {
	var currDB = localStorage.currDB;
	localStorage.currViewCrewName = '';
	localStorage.currViewCrewID = '';
	localStorage.crewList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "crew",
			db_name: currDB,
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('crewlist .done');
		localStorage.crewList = JSON.stringify(data.list);
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function createCrewMenu() {
	var menuList = JSON.parse(localStorage.crewList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, dat) {
		optionList += '<option value="' + dat.ID + '">' + dat.name + '</option>';
	});
	$('#crewMenu').html(optionList);
	$('#crewMenu').selectmenu();
	$('#crewMenu').selectmenu('refresh');
}

function getStudentList(doMenu) {
	var currDB = localStorage.currDB;
	localStorage.studentList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "student",
			db_name: currDB,
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('studentlist .done');
		localStorage.studentList = JSON.stringify(data.list);
		if (doMenu == "selectmenu") {
			createStudentMenu();
		}
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function createStudentListMenu() {
	var menuList = JSON.parse(localStorage.studentList);
	var itemList = "";
	$('div.ui-input-search input').val("");
	//clear entry blank
	$.each(menuList, function (i, dat) {
		itemList += '<li class="ui-screen-hidden ui-btn ui-btn-icon-right ui-icon-carat-r" value="' + dat.ID + '">' + dat.lastName + ', ' + dat.firstName + '</li>';
	});
	$('#studentSelect').html(itemList);
	$('#studentSelect').listview();
	$('#studentSelect').listview("refresh", true);
	//forces rebuild
}

function createStudentMenu() {
	var menuList = JSON.parse(localStorage.studentList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, data) {
		optionList += '<option value="' + data.ID + '">' + data.lastName + ', ' + data.firstName + '</option>';
	});
	switch (activeFileName()) {
	case "enterdeltas.html":
		$('div#enterdeltas #studentMenu').html(optionList);
		$('div#enterdeltas #studentMenu').selectmenu();
		$('div#enterdeltas #studentMenu').selectmenu('refresh', true);
		//forces rebuild
		break;
	case "enterkudos.html":
		$('div#enterkudos #studentMenu').html(optionList);
		$('div#enterkudos #studentMenu').selectmenu();
		$('div#enterkudos #studentMenu').selectmenu('refresh', true);
		//forces rebuild
		break;
	}
}

function getStudentEventList() {
	var currDB = localStorage.currDB;
	var studentID = localStorage.currStudentID;
	localStorage.studentEventList = "";
	localStorage.numStudentEvents = 0;

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "studentevents",
			db_name: currDB,
			op_data: studentID
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('studentevents .done');
		localStorage.studentEventList = JSON.stringify(data.list);
		localStorage.numStudentEvents = data.list.length;
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function studentEventTable() {
	var eventList = JSON.parse(localStorage.studentEventList);
	var tblList = "";
	$.each(eventList, function (i, dat) {
		tblList += '<tr><th>' + dateFromSeconds(parseInt(dat.seconds)) + '</th><td>' + staffNameByID(dat.staffID, "last") + '</td><td>' + dat.items + '</td></tr>';
	});
	$('table#eventTable tbody').html(decodeURIComponent(replaceAll("+", " ", tblList)));
	$('#eventTable').table("refresh");
}

function staffEventTable() {
	//console.log('create staff event table');
	var eventList = JSON.parse(localStorage.staffEventList);
	var tblList = '';

	if (eventList.length === 0) {
		//console.log('no events');
		tblList += "<tr><th>&nbsp;</th><td>&nbsp;</td><td>No Events</td></tr>";
	} else {
		$.each(eventList, function (i, dat) {
			tblList += '<tr><th>' + dateFromSeconds(parseInt(dat.seconds)) + '</th><td>' + studentNameByID(dat.studentID) + '</td><td>' + infractionWithCommentFromEvent(dat.items) + '</td></tr>';
		});
	}
	$('table#eventTable tbody').html(decodeURIComponent(replaceAll("+", " ", tblList)));
	$('#eventTable').table("refresh");
}

function getStaffEventList(staffID) {
	var currDB = localStorage.currDB;
	localStorage.staffEventList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "staffevents",
			db_name: currDB,
			op_data: staffID
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('staffeventlist .done');
		localStorage.staffEventList = JSON.stringify(data.list);
		localStorage.numStaffEvents = data.list.length;
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function getCrewEventList(crewID) {
	var currDB = localStorage.currDB;
	localStorage.crewEventList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "crewevents",
			db_name: currDB,
			op_data: crewID
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('creweventlist .done');
		localStorage.crewEventList = JSON.stringify(data.list);
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function crewEventTable() {
	var eventList = JSON.parse(localStorage.crewEventList);
	var tblList = '';

	if (eventList.length === 0) {
		//console.log('no events');
		tblList += "<tr><th>&nbsp;</th><td>&nbsp;</td><td>No Events</td></tr>";
	} else {
		$.each(eventList, function (i, dat) {
			tblList += '<tr><th>' + dateFromSeconds(parseInt(dat.seconds)) + '</th><td>' + staffNameByID(dat.staffID, "last") + '</td><td>' + dat.items + '</td></tr>';
		});
	}
	$('table#eventTable tbody').html(decodeURIComponent(replaceAll("+", " ", tblList)));
	$('#eventTable').table("refresh");
}

function getDeltaEventList() {
	var studentID = localStorage.currStudentID;
	var currDB = localStorage.currDB;

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "deltaevents",
			db_name: currDB,
			op_data: studentID
		}
	}).done(function (data, textStatus, jqxhr) {
		//console.log('deltaeventlist .done');
		if (data.list.length === 0) {
			localStorage.deltaEventList = "[]";
			localStorage.numDeltaEvents = 0;
		} else {
			var deltaList = '[';
			$.each(data.list, function (i, dat) {
				var itemsDeltas = infractionFromEvent(dat.items);
				var theDeltas = itemsDeltas.split(',');
				//to handle multiple infractions in one event
				for (j = 0; j < theDeltas.length; j++) {
					deltaList += '{"items": "' + theDeltas[j] + '"},';
				}
			});
			deltaList = deltaList.substr(0, deltaList.length - 1);
			deltaList += "]";
			localStorage.deltaEventList = deltaList;
			var array = JSON.parse(deltaList);
			localStorage.numDeltaEvents = array.length;
		}
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function getTimeZero() {
	var currDB = localStorage.currDB;

	$.get("php/status_access.php", {
		access_op: "starttime",
		db_name: currDB,
		op_data: "0"
	}, function (data, status, xhr) {
		localStorage.timeZero = data;
	}, "text");
}

function studentStatusGraph() {
	var currDB = localStorage.currDB;
	var timeZero = localStorage.timeZero;
	var pointList = JSON.parse(localStorage.studentEventList);
	var points = [[0, kStartStatus]];
	var oldDay = 0;
	$.each(pointList, function (i, dat) {
		var day = Math.round((dat.seconds - timeZero) / 86400);
		var status = statusFromEvent(dat.items);
		if (day > oldDay) {
			points.push([day, status]);
			oldDay = day;
		}
	});
	$.plot('#graphcontainer', [{
		label: "",
		data: points,
		color: "#6a9bc2"
	}], {
		series: {
			lines: {
				show: true
			},
			points: {
				show: true
			}
		},
		grid: {
			backgroundColor: {
				colors: ["#fff", "#eee"]
			}
		},
		axisLabels: {
			show: true
		},
		xaxes: [{
			axisLabel: 'Day of Term'
		}],
		yaxes: [{
			position: 'left',
			axisLabel: 'Status',
			min: kMinStatus,
			max: kMaxStatus
		}]
	});
}

function studentDeltaChart() {
	var deltaArray = JSON.parse(localStorage.deltaList);
	var deltaEventList = localStorage.deltaEventList;
	var hOffset = $('div#graphcontainer').height() / 4;
	var container = $('div#graphcontainer');

	var infractionData = [];
	$.each(deltaArray, function (i, value) {
		var count = countOcurrences(deltaEventList, value.name);
		if (count > 0) {
			infractionData.push({
				label: value.name,
				data: count
			});
		}
	});
	setTimeout(function () {
		$.plot(container, infractionData, {
			series: {
				pie: {
					show: true,
					radius: 0.5,
					offset: {
						top: -hOffset,
						left: 0
					}
				}
			},
			legend: {
				show: true,
				labelFormatter: labelFormatter,
				position: "se",
				noColumns: 2,
				backgroundOpacity: 0.4
			}
		});
	}, 500);
}

function labelFormatter(label, series) {
	return "<span style='font-size: 8pt'>" + label + " " + Math.round(series.percent) + "%</span>";
}

function getDeltaList() {
	var currDB = localStorage.currDB;
	localStorage.deltaList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "deltas",
			db_name: currDB,
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		localStorage.deltaList = JSON.stringify(data.list);
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function createDeltaMenu() {
	//console.log('create delta menu');
	var menuList = JSON.parse(localStorage.deltaList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, data) {
		optionList += '<option value="' + data.delta + '">' + data.name + '</option>';
	});
	$('#deltaMenu').html(optionList);
	$('#deltaMenu').selectmenu();
	$('#deltaMenu').selectmenu('refresh', true);
	//forces rebuild
}

function getKudoList() {
	var currDB = localStorage.currDB;
	localStorage.kudoList = "";

	var request = $.ajax({
		dataType: "json",
		url: "php/status_access.php",
		data: {
			access_op: "kudos",
			db_name: currDB,
			op_data: "0"
		}
	}).done(function (data, textStatus, jqxhr) {
		localStorage.kudoList = JSON.stringify(data.list);
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function createKudoMenu() {
	var menuList = JSON.parse(localStorage.kudoList);
	var optionList = "<option data-placeholder='true'>Select...</option>";
	$.each(menuList, function (i, data) {
		optionList += '<option value="' + data.delta + '">' + data.name + '</option>';
	});
	$('#kudoMenu').html(optionList);
	$('#kudoMenu').selectmenu();
	$('#kudoMenu').selectmenu('refresh', true);
	//forces rebuild
}

function postStudentDeltas() {
	console.log('post student deltas');
	var currDB = localStorage.currDB;
	var err = false;

	if (checkKudoDeltaPost("delta")) {
		var staffID = localStorage.currStaffID;
		var comment = $.trim($('#deltaComment').val());
		var items = "";
		var totalDelta = 0;
		$('#deltaMenu option:selected').each(function () {
			items += $(this).text() + ', ';
			totalDelta += parseInt($(this).val());
		});
		console.log(totalDelta);
		getNextID("events");
		//provide for delay with multiple students
		var nextID = parseInt(localStorage.nextID);
		// have to keep track of id because posting is asynchronous
		items = items.substr(0, items.length - 2);
		$('#studentMenu option:selected').each(function () { //loop through students
			var studentID = $(this).val();
			var currStatus = Math.max(kMinStatus, parseInt(statusFromStudentList(studentID)) - totalDelta);
			var query = "INSERT INTO events (ID, studentID, staffID, seconds, items, delta) VALUES ('";
			query += nextID + "', '";
			query += studentID + "', '" + staffID + "', '";
			query += secondsFromDate($('#deltaDateInput').val()) + "', '" + items + " ";
			if (comment !== "") {
				comment = replaceAll(" ", "+", comment);
				comment = comment.replace(/'/g, "\\'");
				query += "[" + comment + "] ";
			}
			query += "[status = " + currStatus + "]', ";
			query += (-1) * totalDelta + ")";
			encodedQuery = encodeURIComponent(query);
			err = postQuery("postevent", encodedQuery);
			if (err) {
				return false;
			} //break out of .each
			nextID = nextID + 1;
			// update student status
			query = "UPDATE student SET status = '" + currStatus + "' WHERE ID = '" + studentID + "'";
			encodedQuery = encodeURIComponent(query);
			postQuery("setstatus", encodedQuery);
		});
		if (!err) {
			$('#postOK').popup('open');
			initialize("enterdeltas");
		} else {
			$('#postErr').popup('open');
		}
	}
}

function postStudentKudos() {
	console.log('post student kudos');
	var currDB = localStorage.currDB;
	var err = false;

	if (checkKudoDeltaPost("kudo")) {
		var staffID = localStorage.currStaffID;
		var comment = $.trim($('#kudoComment').val());
		var items = "";
		var totalKudo = 0;
		$('#kudoMenu option:selected').each(function () {
			items += $(this).text() + ', ';
			totalKudo += parseInt($(this).val());
		});
		console.log(totalKudo);
		getNextID("events");
		//provide for delay with multiple students
		var nextID = parseInt(localStorage.nextID);
		// have to keep track of id because posting is asynchronous
		items = items.substr(0, items.length - 2);
		$('#studentMenu option:selected').each(function () { //loop through students
			var studentID = $(this).val();
			var currStatus = Math.min(kMaxStatus, parseInt(statusFromStudentList(studentID)) + totalKudo);
			var query = "INSERT INTO events (ID, studentID, staffID, seconds, items, delta) VALUES ('";
			query += nextID + "', '";
			query += studentID + "', '" + staffID + "', '";
			query += secondsFromDate($('#kudoDateInput').val()) + "', '" + items + " ";
			if (comment !== "") {
				comment = replaceAll(" ", "+", comment);
				comment = comment.replace(/'/g, "\\'");
				query += "[" + comment + "] ";
			}
			query += "[status = " + currStatus + "]', ";
			query += totalKudo + ")";
			encodedQuery = encodeURIComponent(query);
			err = postQuery("postevent", encodedQuery);
			if (err) {
				return false;
			} //break out of .each
			nextID = nextID + 1;
			// update student status
			query = "UPDATE student SET status = '" + currStatus + "' WHERE ID = '" + studentID + "'";
			encodedQuery = encodeURIComponent(query);
			postQuery("setstatus", encodedQuery);
		});
		if (!err) {
			$('#postOK').popup('open');
		} else {
			$('#postErr').popup('open');
		}
	}
}

function postQuery(postOp, theQuery) {
	var currDB = localStorage.currDB;
	var err = false;
	$.post("php/status_post.php", {
		post_op: postOp,
		db_name: currDB,
		op_data: theQuery
	}, function (data, status) {
		if (status !== "success") {
			alert(postOp + " Error. Data: " + data + "\nStatus: " + status);
			err = true;
		}
	});
	return err;
}

function getNextID(theTable) {
	var currDB = localStorage.currDB;
	var lastID = localStorage.nextID;
	var request = $.ajax({
		dataType: "text",
		url: "php/status_access.php",
		data: {
			access_op: "getNextID",
			db_name: currDB,
			op_data: theTable
		}
	}).done(function (returnedData, textStatus, jqxhr) {
		localStorage.nextID = returnedData;
	}).fail(function (jqxhr, textStatus, errorThrown) {
		alert(jqxhr.status + ", " + textStatus + ", " + errorThrown);
	});
}

function checkKudoDeltaPost(which) {
	var postDate;
	if (which == "delta") {
		postDate = $('#deltaDateInput').val();
	} else {
		postDate = $('#kudoDateInput').val();
	}
	if (typeof (postDate) == "undefined" || !isValidDate(postDate)) {
		$('#notValidDate').popup('open');
		return false;
	}
	if ($('a#studentMenu-button').text() == "Select...0") {
		$('#noStudentErr').popup('open');
		return false;
	}
	if (which == "delta") {
		if ($('a#deltaMenu-button').text() == "Select...0") {
			$('#noDeltaErr').popup('open');
			return false;
		}
	} else {
		if ($('a#kudoMenu-button').text() == "Select...0") {
			$('#noKudoErr').popup('open');
			return false;
		}
	}
	return true;
}

function checkLogin() {

	var staffName = $('#staffMenu0 option:selected').text();
	var passWord = $('#password').val();

	if (staffName == "Select...") {
		console.log('staffName not Select...');
		$('#noStaffErr').popup('open');
		return false;
	}
	localStorage.isAdmin = false;
	/* disable admin functions
	 if ( passWord == kAdminPass ) {
	 localStorage.isAdmin = true;
	 return true;
	 }
	 */
	if (passWord == kStaffPass) {
		return true;
	} else {
		$('#loginErr').popup('open');
		return false;
	}
}

function checkValidUser() {
	if (localStorage.currStaffName === "" || localStorage.currStaffID === "") {
		$('#loginRequired').popup('open');
		return false;
	} else {
		return true;
	}
}

// Utility functions

function isValidDate(str) {
	var parts = str.split('/');
	if (parts.length < 3)
		return false;
	else {
		var day = parseInt(parts[1]);
		var month = parseInt(parts[0]);
		var year = parseInt(parts[2]);
		if (isNaN(day) || isNaN(month) || isNaN(year)) {
			return false;
		}
		if (day < 1 || year < 1)
			return false;
		if (month > 12 || month < 1)
			return false;
		if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31)
			return false;
		if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30)
			return false;
		if (month == 2) {
			if (((year % 4) === 0 && (year % 100) !== 0) || ((year % 400) === 0 && (year % 100) === 0)) {
				if (day > 29)
					return false;
			} else {
				if (day > 28)
					return false;
			}
		}
		return true;
	}
}

function dbText(optionText) {
	var dbName = "status" + optionText.substr(12, 2) + optionText.substr(5, 1);
	return dbName;
}

function staffNameByID(staffID, which) {
	var staffObjList = JSON.parse(localStorage.staffList);
	for (i = 0; i < staffObjList.length; i++) {
		if (staffObjList[i].ID == staffID) {
			switch (which) {
			case 'last':
				return staffObjList[i].lastName;
			case 'first':
				return staffObjList[i].firstName;
			case 'both':
				return staffObjList[i].lastName + ", " + staffObjList[i].firstName;
			default:
				return "Incorrect name request.";
			}
		}
	}
	return "name not found";
}

function studentNameByID(studentID) {
	var studentObjList = JSON.parse(localStorage.studentList);
	for (i = 0; i < studentObjList.length; i++) {
		if (studentObjList[i].ID == studentID) {
			return studentObjList[i].lastName + ", " + studentObjList[i].firstName;
		}
	}
	return "name not found";
}

function dateFromSeconds(seconds) {
	var now = new Date();
	var offset = now.getTimezoneOffset();
	var d = new Date((seconds + (offset * 60)) * 1000);
	//javascript counts in milliseconds
	var curr_date = String(d.getDate());
	var curr_month = String(d.getMonth() + 1);
	//getMonth returns an index
	var curr_year = String(d.getFullYear());
	return (curr_month + "/" + curr_date + "/" + curr_year);
}

function secondsFromDate(dateStr) {
	var res = dateStr.split("/");
	var postTime = new Date(res[2], res[0] - 1, res[1]);
	//months are 0-based
	return postTime.getTime() / 1000;
}

function replaceAll(find, replace, str) {
	while (str.indexOf(find) !== -1) {
		str = str.replace(find, replace);
	}
	return str;
}

function statusFromLastEvent() {
	var objList = JSON.parse(localStorage.studentEventList);
	var objLen = objList.length;
	if (objList.length === 0) {
		return kStartStatus;
	} else {
		return statusFromEvent(objList[objLen - 1].items);
	}
}

function statusFromStudentList(studentID) {
	var array = JSON.parse(localStorage.studentList);
	for (i = 0; i < array.length; i++) {
		if (array[i].ID == studentID) {
			return array[i].status;
		}
	}
}

function statusFromEvent(str) {
	var endStr = str.substr(str.lastIndexOf("=") + 1);
	return parseInt(endStr);
}

function nowInSeconds() {
	var now = new Date();
	var offset = now.getTimezoneOffset();
	return parseInt(now.getTime() / 1000) + (offset * 60);
}

function dayFromSeconds(seconds) {
	var timeZero = localStorage.timeZero;
	return Math.round((seconds - timeZero) / 86400);
}

function infractionFromEvent(event) {
	var infraction = event.substr(0, event.indexOf('[') - 1);
	return infraction.trim();
}

function infractionWithCommentFromEvent(event) {
	var str = event.substr(0, event.lastIndexOf('['));
	return str.trim();
}

// count how many times value appears in str
function countOcurrences(str, value) {
	var regExp = new RegExp(value, "gi");
	return str.match(regExp) ? str.match(regExp).length : 0;
}

function activeFileName() {
	var myurl = $.mobile.navigate.history.getActive().url;
	return myurl.substring(myurl.lastIndexOf("/") + 1);
}

function firstStackIndex() {
	for (i = 0; i < $.mobile.navigate.history.stack.length; i++) {
		if ($.mobile.navigate.history.stack[i].url == $.mobile.navigate.history.getActive().url) {
			return i;
		}
	}
	return -1;
}

function clearForwardStack() {
	var theIndex = firstStackIndex();
	//this is the first index of the current location
	if (theIndex >= 0) {
		console.log('clearing from ' + (theIndex + 1) + ' forward');
		$.mobile.navigate.history.stack = $.mobile.navigate.history.stack.slice(0, theIndex + 1);
	}
}