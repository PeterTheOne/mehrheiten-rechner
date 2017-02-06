(function ($) {
  'use strict';

  var partyColors = {
    "ÖVP": '#000000',
    "KPÖ": '#aa0000',
    "SPÖ": '#E31E2D',
    "FPÖ": '#205CA5',
    "Grüne": '#51A51E',
    "Piratenpartei": '#6E17A1',
    "NEOS": '#E84188'
  };

  var partyNames = {
    "ÖVP": '<span class="partyName oevp">ÖVP</span>',
    "KPÖ": '<span class="partyName kpoe">KPÖ</span>',
    "SPÖ": '<span class="partyName spoe">SPÖ</span>',
    "FPÖ": '<span class="partyName fpoe">FPÖ</span>',
    "Grüne": '<span class="partyName gruene">GRÜNE</span>',
    "Piratenpartei": '<span class="partyName pirat">PIRAT</span>',
    "NEOS": '<span class="partyName neos">NEOS</span>'
  };

  var CouncilMembers = function () {
    this.list = null;
    this.dimensions = {
      x: 0,
      y: 0
    };
    this.matrix = null;
  };

  CouncilMembers.prototype.load = function () {
    var self = this;
    return $.getJSON('json/councilMembers.json', null, function (data, textStatus, jqXHR) {
      self.list = data;
      $.each(self.list, function (index, member) {
        member.id = index;
        member.gone = false;
        member.name = '';
        member.name += member.akad_Vor ? member.akad_Vor + ' ': '';
        member.name += member.Vorname_text + ' ' + member.Familienname + ' ';
        member.name += member.akad_Nach ? member.akad_Nach + ' ': '';
        member.name += '(' + member.Fraktion + ')';
      });
      self.calculateDimensions();
      self.createMatrix();
    });
  };

  CouncilMembers.prototype.calculateDimensions = function () {
    var maxDimention = {
      x: 0,
      y: 0
    };
    $.each(this.list, function (index, member) {
      if (member.seat.x > maxDimention.x) {
        maxDimention.x = member.seat.x
      }
      if (member.seat.y > maxDimention.y) {
        maxDimention.y = member.seat.y
      }
    });
    this.dimensions = maxDimention;
  };

  CouncilMembers.prototype.createMatrix = function () {
    var matrix = [];
    for (var y = 0; y <= this.dimensions.y; y++) {
      var row = [];
      for (var x = 0; x <= this.dimensions.x; x++) {
        row.push(null);
      }
      matrix.push(row);
    }
    $.each(this.list, function (index, member) {
      matrix[member.seat.y][member.seat.x] = index;
    });
    this.matrix = matrix;
  };

  CouncilMembers.prototype.getList = function () {
    return this.list;
  };

  CouncilMembers.prototype.getDimensions = function () {
    return this.dimensions;
  };

  CouncilMembers.prototype.getMemberBySeat = function (x, y) {
    return this.list[this.matrix[y][x]];
  };

  CouncilMembers.prototype.come = function (id) {
    this.list[id ].gone = false;
  };

  CouncilMembers.prototype.go = function (id) {
    this.list[id].gone = true;
  };

  CouncilMembers.prototype.getMembersCount = function () {
    var count = {
      numberMembers: 0,
      numberMembersHere: 0,
      numberMembersGone: 0
    };
    $.each(this.list, function (index, member) {
      count.numberMembers++;
      if (member.gone) {
        count.numberMembersGone++;
      } else {
        count.numberMembersHere++;
      }
    });
    return count;
  };

  CouncilMembers.prototype.getParties = function () {
    var parties = {};
    $.each(this.list, function (index, member) {
      if (!parties.hasOwnProperty(member.Fraktion)) {
        var party = {
          id: member.Fraktion,
          numberMembers: 0,
          numberMembersHere: 0,
          numberMembersGone: 0
        };
        parties[member.Fraktion] = party;
      }
      parties[member.Fraktion ].numberMembers++;
      if (member.gone) {
        parties[member.Fraktion ].numberMembersGone++;
      } else {
        parties[member.Fraktion ].numberMembersHere++;
      }
    });
    parties = $.map(parties, function(value, index) {
      return [value];
    });
    parties = parties.sort(function (a, b) {
      return a.numberMembersHere < b.numberMembersHere;
    });
    return parties;
  };


  function updateSeats(councilMembers) {
    var $seats = $('.seats').empty();
    var dimensions = councilMembers.getDimensions();

    for (var y = 0; y <= dimensions.y; y++) {
      var $row = $('<tr>');
      for (var x = 0; x <= dimensions.x; x++) {
        var $cell = $('<td>');
        var $seat = $('<div class="seat">');
        var member = councilMembers.getMemberBySeat(x, y);
        if (member) {
          $seat.data('member-id', member.id);
          $seat.attr('title', member.name);
          var $name = $('<span class="name">');
          $name.text(member.Vorname_text + ' ' + member.Familienname);
          $seat.append($name);
          var color = partyColors[member.Fraktion];
          $seat.css('background-image', "url('images/members/" + member.image + "')");
          $cell.css('background-color', color);
          $seat.on('click', function () {
            if ($(this).hasClass('gone')) {
              councilMembers.come($(this).data('member-id'));
              $(this).removeClass('gone');
            } else {
              councilMembers.go($(this).data('member-id'));
              $(this).addClass('gone');
            }
            updateMembers(councilMembers);
            updateParties(councilMembers);
            updateMajorities(councilMembers);
          });
          $cell.append($seat);
        }
        $row.append($cell);
      }
      $seats.prepend($row);
    }

    // center table
    $('.table-outer').animate({ scrollLeft: ($('.seats').width() / 2) - ($(window).width() / 2) }, 600);
  }

  function updateMembers(councilMembers) {
    var $members = $('.members').empty();
    var membersCount = councilMembers.getMembersCount();

    $members.append($('<tr>').html('<td>Gesamt: </td><td>' + membersCount.numberMembers + '</td>'));
    $members.append($('<tr>').html('<td>Anwesend: </td><td>' + membersCount.numberMembersHere + '</td>'));
    $members.append($('<tr>').html('<td>Abwesend: </td><td>' + membersCount.numberMembersGone + '</td>'));
    $members.append($('<tr>').html('<td>Mehrheit mit: </td><td>' + Math.floor((membersCount.numberMembersHere / 2) + 1) + '</td>'));
  }

  function updateParties(councilMembers) {
    var $parties = $('.parties').empty();
    var parties = councilMembers.getParties();

    $.each(parties, function (index, party) {
      var $party = $('<tr>');
      $party.html('<td>' + partyNames[party.id] + '</td><td>' + party.numberMembersHere + '</td><td>(' + party.numberMembers + ')</td>');
      $parties.append($party);
    });
  }

  function updateMajorities(councilMembers) {
    var $majorities = $('.majorities').empty();
    var membersCount = councilMembers.getMembersCount();
    var parties = councilMembers.getParties();
    var majorities = [];

    var combine = function(a) {
      var fn = function(n, src, got, all) {
        if (n == 0) {
          if (got.length > 0) {

            all[all.length] = got;
          }
          return;
        }
        for (var j = 0; j < src.length; j++) {
          fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
      };
      var all = [];
      for (var i = 0; i < a.length; i++) {
        fn(i, a, [], all);
      }
      all.push(a);
      return all;
    };

    var subsets = combine(parties);

    //console.log(subsets.length);
    //console.log(subsets);

    subsets = subsets.filter(function (subset) {
      var numberMembersHere = 0;
      $.each(subset, function (index, party) {
        numberMembersHere += party.numberMembersHere;
      });
      return numberMembersHere > membersCount.numberMembersHere / 2;
    });

    //console.log(subsets.length);
    //console.log(subsets);

    subsets = subsets.filter(function (subset1) {
      var keep = true;
      $.each(subsets, function (index2, subset2) {
        if (subset1.length > subset2.length) {
          // check if subset1 is a superset of subset2
          for (var i = 0; i < subset2.length; i++) {
            if (subset1.indexOf(subset2[i]) == -1) {
              return true;
            }
          }
          keep = false;
          return false;
        }
      });
      return keep;
    });

    //console.log(subsets.length);
    //console.log(subsets);

    $.each(subsets, function (index, subset) {
      var majority = {
        name: '',
        set: [],
        numberMembers: 0,
        numberMembersHere: 0,
        numberMembersGone: 0
      };
      $.each(subset, function (index, party) {
        majority.name += partyNames[party.id] + ' + ';
        majority.set.push(party);
        majority.numberMembers += party.numberMembers;
        majority.numberMembersHere += party.numberMembersHere;
        majority.numberMembersGone += party.numberMembersGone;
      });
      majority.name = majority.name.slice(0, -3);
      majorities.push(majority);
    });

    $.each(majorities, function (index, majority) {
      var $line = $('<tr>');
      $line.html('<td>' + majority.name + '</td><td> = ' + majority.numberMembersHere + '</td>');
      $majorities.append($line);
    });
  }

  $(function () {
    var councilMembers = new CouncilMembers();
    var jqXHR = councilMembers.load();

    $.when(jqXHR).then(function () {
      updateSeats(councilMembers);
      updateMembers(councilMembers);
      updateParties(councilMembers);
      updateMajorities(councilMembers);
    });
  });
})(jQuery);
