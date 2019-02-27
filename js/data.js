function showStreams() {
    $('.carousel').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        swipeToSlide: true,
        arrows: true,
        prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
        nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>",
    });

    console.log("Add streams dynamic");
    gunDB.get('streams').map().once(function (stream, id) {
        let vid = '<video height="132" width="212" id="' + id + '"autoplay muted onerror="failed(event)"' +
            'poster="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80">' +
            '>' +
            '<source src="data:video/webm;base64,' + stream.name + '" onerror="failed(event)">' +
            '</video>'
        $('.carousel').slick('slickAdd', '<div>' + vid + '</div>');
    });
}

function failed(e) {
    console.log(e);
    if (e.type == "error") {
        e.target.src
    }
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