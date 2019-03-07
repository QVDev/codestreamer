var swiper;
function showStreams() {

  $(document).ready(function () {
    //initialize swiper when document ready
    swiper = new Swiper('.swiper-container', {
      slidesPerView: 3,
      centeredSlides: true,
      spaceBetween: 30,
      initialSlide: 1,
      delay: 1000,
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
        hide: true,
      },
    });
    swiper.on('click', function (event) {
      if (swiper.clickedIndex != null) {
        let streamId = swiper.slides[swiper.clickedIndex].getElementsByTagName('video')[0].id;
        if (streamId != 'screen_cast_video') {
          console.log('slide clicked::' + streamId);
          let watch = location.href + "viewer.html#" + streamId;
          openInNewTab(watch);
        }
      }
    });
  });

  console.log("Add streams dynamic");
  gunDB.get(DB_RECORD).map().once(function (stream, id) {
    if (checkStreamValidity(stream, id)) {
      let vid = '<video width="100%" id="' + id + '"autoplay muted onerror="failed(event)"' +
        'poster="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80">' +
        '>' +
        '<source src="data:video/webm;base64,' + stream.name + '" onerror="failed(event)">' +
        '</video>';
      swiper.appendSlide('<div class="swiper-slide">' + vid + '</div>');
      swiper.update();
    }
  });
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function checkStreamValidity(stream, id) {
  console.log("Stream::" + id);
  if (stream == null || stream.timestamp == null) {
    removeFromGun(id);
    return false;
  }
  let currentTime = new Date().getTime();
  var difference = (currentTime - stream.timestamp) / 1000;
  console.log("TIME::" + difference)
  if (difference > 120) {
    return false;
  }
  return true;
}

function failed(e) {
  console.log(e);
  removeFromGun(e.target.parentNode.id);
  if (e.type == "error") {
    e.target.src
  }
}

function removeFromGun(streamId) {
  var user = gunDB.get(streamId)
  gunDB.get(DB_RECORD).unset(user);
  user.put(null)
}

/*<div class="row text-center text-lg-left">
<div class="col-lg-3 col-md-4 col-6">
  <a href="javascript:;" class="d-block mb-4 h-100">
    <video width="100%" id="remote_video" autoplay controls muted
      poster="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80">
    </video>
  </a>
</div>
</div>
*/