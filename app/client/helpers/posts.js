var posts = DEPNES.namespace('client.helpers.posts');

posts.intactToFormatted = function (content) {
  // it works ok
  var $formatted,
      formatted,
      fullyFormatted = [],
      $pouch = $('<div class="pouch"></div>'),
      tmp;

  $formatted = $(content).map(function () {
    var $this = $(this),
        flag;

    $this.contents().filter(function () {
      (function nodeLoop(node) {
        if (node.nodeType == 3) {
          flag = true;
          return;
        }

        var childNodes = node.childNodes,
            max = childNodes.length,
            i = 0;
        for (; i < max; i += 1) {
          nodeLoop(childNodes[i]);
        }
        return;
      }(this));
    });


    if (flag) {
      $(this).addClass('text-node');
    } else {
      $(this).addClass('blank');
    }

    return $('<div>').append(this).html();
  });

  formatted = $formatted.get();

  formatted.forEach(function (el, index) {
    var $el = $(el);
    if ($el.hasClass('text-node')) {
      if (index === formatted.length-1) {
        $pouch.append(el);
        tmp = $('<div></div>');
        tmp.append($pouch);
        fullyFormatted.push(tmp.html());
        $pouch = $('<div class="pouch"></div>');
      } else {
        $pouch.append(el);
      }
    } else {
      if (index > 0) {
        if ($($formatted[index-1]).hasClass('text-node')) {
          tmp = $('<div></div>');
          tmp.append($pouch);
          fullyFormatted.push(tmp.html());
          $pouch = $('<div class="pouch"></div>');
          fullyFormatted.push(el);
        } else {
          fullyFormatted.push(el);
        }
      } else {
        fullyFormatted.push(el);
      }
    }
  });
  return fullyFormatted;
};
