var FOG_ENABLED = true;

var container, stats;

var camera, scene, renderer;

var text, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Some global stuff - ouch - refactor
var first_piece;
var next_piece;
var last_piece;

// Whale config
var default_next_animate_delay = 10;
var default_x = 0;
var default_fin_x_offset = -25;
var default_y = 125;
var start_z = -900;
var default_z_move = 10;

// Mediaz

var WATER_COLOR = 0xaaccff;
var WHALE_MATERIAL = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('textures/whale_colors_1.png')});
var WHALE_SONGS = [new Audio("resources/orca1.wav"),
                   new Audio("resources/orca2.wav"),
                   new Audio("resources/orca3.wav"),
                   new Audio("resources/orca4.wav"),
                   new Audio("resources/orca5.wav")];

// Sizes, length
var body_max_radius = 170;
var front_min_radius = 60;
var front_num_pieces = 9;
var body_num_pieces = 5;
var tail_min_radius = 40;
var tail_max_y_offset = -300;
var tail_num_pieces = 12;

var eye_stack_position = 3;
var eye_radius = 10;
var eye_x_offset = 60;
var eye_y_offset = 60;

var dorsal_stack_position = 13;
var dorsal_y_offset = 155;

var fins_start_stack_position = 7;
var fin_heights = [10, 15, 19, 19, 17, 17];
var fin_lengths = [50, 100, 225, 200, 175, 100];
var fin_y_adjustment = 15;
var fin_x_offsets = [290,280,180,180,180,140];
var fin_y_offsets = [-210, -197, -120, -120, -120, -95];
var left_fin_y_correction = -35;
var left_fin_x_correction = 30;
var fin_default_z_offset = 5;
var fin_default_rotation = .7;

// Ditch this
var debugobj;

init();
animate();

function range_slope(start, end, num) {
    init_range = _.range(0, end-start);
    ret_range = [];
    mod_point = Math.ceil((end-start)/num);
    for (var i = 0; i<init_range.length; i++) {
        if (init_range[i] % mod_point == 0) {
            ret_range.push(init_range[i] + start);
        }
    }

    while (ret_range.length < num) {
        ret_range.push(end);
    }

    return ret_range;
}



function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    halfWidth = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1100 );
    camera.position.set( 0, 0, 200);

    scene = new THREE.Scene();

    if (FOG_ENABLED) {
        fog = new THREE.Fog(WATER_COLOR, 800, 1200);
        scene.fog = fog;
    }

    parent = new THREE.Object3D();
    scene.add( parent );

    // Lighting
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 150, 200 );
    scene.add( directionalLight );


    function addShape( circleGeom, color, x, y, z, rx, ry, rz, s, usecolor ) {

        if (usecolor == true) {
            var material = new THREE.MeshLambertMaterial( { color: color, overdraw: true } );
        } else {
            var texture = THREE.ImageUtils.loadTexture('textures/whale_colors_2.png');
            texture.offset.x = 0.05;
            texture.offset.y = 0.05;
            texture.repeat.x = 0.9;
            texture.repeat.y = 0.9;

        	var material = new THREE.MeshLambertMaterial( { map: texture} );
        }

    	var mesh = new THREE.Mesh( circleGeom, material );
    	mesh.position.set( x, y, z );
    	mesh.rotation.set( rx, ry, rz );
    	mesh.scale.set( s, s, s );
        // console.log(mesh);
    	parent.add( mesh );
    }

    function makeWhalePiece(shape, color, x, y, z, next_shape, next_animate_delay, xoffset, yoffset, usecolor) {
        addShape(shape, color, x, y, z, 0, 0, 0, 1, usecolor);
        console.log([shape, color, x, y, z]);
        return {
            x: x,
            y: y,
            z: z,
            shape: shape,
            position_in_scene: scene.children[0].children.length - 1,
            next_shape: next_shape,
            next_animate_delay: next_animate_delay,
            xoffset: xoffset | 0,
            yoffset: yoffset | 0,
            siblings: null
        };
    }

    function makeOffsetWhaleCircle(radius, color, z, x_offset, y_offset, next_shape) {
        return makeWhalePiece(makeCircle(radius), color, default_x + x_offset, default_y + y_offset, z, next_shape, default_next_animate_delay, x_offset, y_offset);
    }
    function makeBasicWhaleCircle(radius, color, z, next_shape) {
        return makeWhalePiece(makeCircle(radius), color, default_x, default_y, z, next_shape, default_next_animate_delay, 0, 0);
    }

    function makeCircle( radius ) {
        return new THREE.CircleGeometry(radius, 32);
    }

    function makeFin(alength, aheight) {
                var x = 0, y = 0;

                var finShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths

                finShape.moveTo( x + 0, y + 0 );
                // finShape.arc( 40, 40, 40, 0, Math.PI*2, false );
                var arcShape = new THREE.Shape();
                // arcShape.moveTo( 0, 0 );
                // arcShape.absellipse( 10, 10, 50, 10, 6, false );


                // arcShape.moveTo( 65, 20 );
                // arcShape.absellipse( 25, 20, 40, 10, 0, Math.PI*2, true );
                console.log(alength)
                console.log(aheight)
                arcShape.moveTo( 25 + alength, 20 );
                arcShape.absellipse( 25, 20, alength, aheight, 0, Math.PI*2, true );
                // heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
                // heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
                // heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
                // heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
                // heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
                // heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );
                var geometry = new THREE.ShapeGeometry( arcShape );
                return geometry;
                // addShape(geometry, 0x000000, 400, 100, get_z(), 0, 0, 0, 1);
                // var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshBasictMaterial( { map: color } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
                // mesh.position.set( x, y, z - 125 );
                // mesh.rotation.set( rx, ry, rz );
                // mesh.scale.set( s, s, s );
                // parent.add( mesh );
    }

    var current_color = 0xffffff;
    function altColor() {
        if (current_color == 0x000000) {
            current_color = 0xffffff;
        } else {
            current_color = 0x000000;
        }

        return current_color;
    }

    var current_z = start_z;
    function get_z(z_move) {
        z_move = z_move == undefined ? default_z_move : z_move;
        current_z = current_z + z_move;
        return current_z;
    }

        //     function makeOffsetWhaleCircle(radius, color, z, x_offset, y_offset, next_shape)
    function process_pieces_stack_piece(piece_def, next) {
        if (piece_def[0] == 'basic') {
            piece = makeBasicWhaleCircle(piece_def[1], piece_def[2], piece_def[3], next);
        } else if (piece_def[0] == 'offset') {
            piece = makeOffsetWhaleCircle(piece_def[1], piece_def[2], piece_def[3], piece_def[4], piece_def[5], next);
        } else if (piece_def[0] == 'mapped') {
            piece_map = piece_def[1];
            //     function makeWhalePiece(shape, color, x, y, z, next_shape, next_animate_delay, xoffset, yoffset)
            xoffset = piece_map['xoffset'] | 0;
            yoffset = piece_map['yoffset'] | 0;
            basex = piece_map['x'] | default_x;
            basey = piece_map['y'] | default_y;

            piece = makeWhalePiece(
                piece_map['shape'] == undefined ? makeCircle(piece_map['radius']) : piece_map['shape'],
                piece_map['color'] == undefined ? altColor() : piece_map['color'],
                basex + xoffset,
                basey + yoffset,
                piece_map['z'],
                next,
                piece_map['next_animate_delay'] == undefined ? default_next_animate_delay : piece_map['next_animate_delay'],
                xoffset,
                yoffset,
                piece_map['usecolor']
            );
        }

        return piece;
    }

    function process_pieces_stack(stack) {
        piece = null;
        var processed_stack = [];
        for (var i=0; i<stack.length; i++) {
            piece = process_pieces_stack_piece(stack[i], piece);
            processed_stack.push(piece);
        }
        last_piece = piece;
        return processed_stack;
    }

    function add_siblings(piece, sibling_stack) {
        piece.siblings = [];
        for (var i = 0; i < sibling_stack.length; i++) {
            piece.siblings.push(process_pieces_stack_piece(sibling_stack[i]))
        }
    }

    function paint_whale(stack) {
        function get_piece_shape(stack, index) {
            var piece = stack[index];
            var shape = scene.children[0].children[piece.position_in_scene];
            return shape;
        }
        function set_repeat_offset(shape, rx, ry, ox, oy, img) {
            if (img != undefined) {
                i_texture = THREE.ImageUtils.loadTexture(img);
                shape.material.map = i_texture;
            }

            shape.material.map.repeat.x = rx;
            shape.material.map.repeat.y = ry;
            shape.material.map.offset.x = ox;
            shape.material.map.offset.y = oy;
        }
        var current_index = stack.length-1;
        function next_index() {
            return current_index--;
        }
        function next_shape() {
            return get_piece_shape(stack, next_index());
        }
        function set_next_ro(rx, ry, ox, oy, img) {
            set_repeat_offset(next_shape(), rx, ry, ox, oy, img);
        }

        set_next_ro(.6, .7, .2, 0);
        set_next_ro(.6, .7, .2, .05);
        set_next_ro(.6, .6, .2, .13);
        set_next_ro(.6, .45, .2, .22, 'textures/whale_colors_2_eyes.png');
        // set_next_ro(.9, .9, .05, .05, 'textures/whale_colors_2_eyes.png');
        set_next_ro(.6, .4, .2, .27, 'textures/whale_colors_2_eyes.png');
        // set_next_ro(.9, .9, .05, .05, 'textures/whale_colors_2_eyes.png');
        set_next_ro(.6, .3, .2, .31, 'textures/whale_colors_2_eyes.png');
        // set_next_ro(.9, .9, .05, .05, 'textures/whale_colors_2_eyes.png');



    }


    function add_whale() {
        var whale_pieces_stack = [];

        // tail
        tail_piece = makeFin(200, 20);
        whale_pieces_stack.push(['mapped', {shape: tail_piece, color: 0xffffff, z: get_z(), yoffset: tail_max_y_offset-8, xoffset: default_fin_x_offset, usecolor: true, next_animate_delay: 0}]);
        tail_piece = makeFin(200, 20);
        whale_pieces_stack.push(['mapped', {shape: tail_piece, color: 0x000000, z: get_z(0.1), yoffset: tail_max_y_offset, xoffset: default_fin_x_offset, usecolor: true}]);

        tail_piece = makeFin(170, 17);
        whale_pieces_stack.push(['mapped', {shape: tail_piece, color: 0xffffff, z: get_z(4), yoffset: tail_max_y_offset - 10, xoffset: default_fin_x_offset, usecolor: true, next_animate_delay: 0}]);
        tail_piece = makeFin(170, 17);
        whale_pieces_stack.push(['mapped', {shape: tail_piece, color: 0x000000, z: get_z(0.1), yoffset: tail_max_y_offset - 2, xoffset: default_fin_x_offset, usecolor: true}]);


        // Backside/tail slope
        var backside_radius = range_slope(tail_min_radius, body_max_radius, tail_num_pieces);
        var backside_y_push = range_slope(tail_max_y_offset, 0, tail_num_pieces);
        _.zip(backside_radius, backside_y_push).map(function(radius_yoffset) {
            whale_pieces_stack.push(['offset', radius_yoffset[0], altColor(), get_z(), 0, radius_yoffset[1]]);
        });

        // Mid length
        for (var i = 0; i < body_num_pieces; i++) {
            whale_pieces_stack.push(['basic', body_max_radius, altColor(), get_z()]);
        }
        // From max diameter to front
        var frontside_radius = range_slope(front_min_radius, body_max_radius, front_num_pieces).reverse();
        frontside_radius.map(function(radius) {
            whale_pieces_stack.push(['basic', radius, altColor(), get_z()]);
        });

        whale_pieces_stack[whale_pieces_stack.length - 1].next_animate_delay = 3;
        whale_pieces_stack.push(['mapped', {radius: 50, color: altColor(), z: get_z(3), next_animate_delay: 3}]);
        whale_pieces_stack.push(['mapped', {radius: 40, color: altColor(), z: get_z(1), next_animate_delay: 0}]);
        // console.log(whale_pieces_stack);

        var processed_stack = process_pieces_stack(whale_pieces_stack);


        // Preserve a copy of the main body stack, for adding features based on offsets.
        var body_circles = processed_stack.slice(0);

        // Main stack complete - add more pylons
        var eye_z = processed_stack[processed_stack.length - (eye_stack_position+1)].z;
        eye_stack = [
            ['offset', eye_radius, 0x000000, eye_z, -eye_x_offset, eye_y_offset],
            ['offset', eye_radius, 0x000000, eye_z, eye_x_offset, eye_y_offset]
        ];

        add_siblings(processed_stack[processed_stack.length-(eye_stack_position+1)], eye_stack);



        // Add dorsal fin pieces
        dorsal_geometry = makeFin(21, 250);
        dorsal_geometry_smaller = makeFin(20, 235);
        dorsal_geometry_hump = makeFin(18, 70);
        dorsal_geometry_lilhump = makeFin(12, 30);

        dorsal_3_back = processed_stack[processed_stack.length - (dorsal_stack_position+6)];
        dorsal_2_back = processed_stack[processed_stack.length - (dorsal_stack_position+5)];
        dorsal_1_back = processed_stack[processed_stack.length - (dorsal_stack_position+4)];
        dorsal_rider = processed_stack[processed_stack.length - (dorsal_stack_position+3)];
        dorsal_1_forward = processed_stack[processed_stack.length - (dorsal_stack_position+2)];
        dorsal_2_forward = processed_stack[processed_stack.length - (dorsal_stack_position+1)];
        dorsal_3_forward = processed_stack[processed_stack.length - (dorsal_stack_position)];

        add_siblings(dorsal_3_back, [
            ['mapped', {shape: dorsal_geometry_lilhump, color: 0x000000, z: dorsal_3_back.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_2_back, [
            ['mapped', {shape: dorsal_geometry_hump, color: 0x000000, z: dorsal_2_back.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_1_back, [
            ['mapped', {shape: dorsal_geometry_smaller, color: 0x000000, z: dorsal_1_back.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_rider, [
            ['mapped', {shape: dorsal_geometry, color: 0x000000, z: dorsal_rider.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_1_forward, [
            ['mapped', {shape: dorsal_geometry_smaller, color: 0x000000, z: dorsal_1_forward.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_2_forward, [
            ['mapped', {shape: dorsal_geometry_hump, color: 0x000000, z: dorsal_2_forward.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);
        add_siblings(dorsal_3_forward, [
            ['mapped', {shape: dorsal_geometry_lilhump, color: 0x000000, z: dorsal_3_forward.z - 5, yoffset: dorsal_y_offset, xoffset: default_fin_x_offset, usecolor: true}]
        ]);

        // Ok, left and right fins
        var fins = _.zip(fin_lengths, fin_heights).map(function(fin_dims) {
            return makeFin(fin_dims[0], fin_dims[1]);
        });
        var fin_riders = [];
        for (var i = fin_lengths.length - 1; i >= 0; i--) {
            fin_riders.push(body_circles[body_circles.length - (fins_start_stack_position + i)]);
        }
        _.zip(fins, fin_riders, fin_x_offsets, fin_y_offsets).map(function(fin_config) {
            fin_rider = fin_config[1];
            add_siblings(fin_rider, [
                ['mapped', {shape: fin_config[0], color: 0x000000, z: fin_rider.z - fin_default_z_offset, xoffset: fin_config[2] + default_fin_x_offset, yoffset: fin_config[3] + fin_y_adjustment, usecolor: true}],
                ['mapped', {shape: fin_config[0], color: 0x000000, z: fin_rider.z - fin_default_z_offset, xoffset: -fin_config[2] + default_fin_x_offset + left_fin_x_correction, yoffset: fin_config[3] + fin_y_adjustment + left_fin_y_correction, usecolor: true}]

            ]);

            // HACKY
            scene.children[0].children[fin_rider.siblings[0].position_in_scene].rotateZ(-fin_default_rotation);
            scene.children[0].children[fin_rider.siblings[1].position_in_scene].rotateZ(fin_default_rotation);
        });

        // Ok, add textures to make it more... lifelike
        paint_whale(body_circles);
   }


    add_whale();

    function make_bubble() {
        var material = new THREE.MeshLambertMaterial({color: 0xffffff, opacity: .1, transparent: true});
        var geom = new THREE.SphereGeometry(_.random(20,30), 32, 16);
        return new THREE.Mesh(geom, material);
    }

    for ( var i = 0; i < 10; i++ ) {
        var bubble = make_bubble();
        initBubble(bubble);
        parent.add(bubble);
    }

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize($(document).width(), $(document).height());
    renderer.sortObjects = false;
    renderer.sortElements = false;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );

}


function initBubble(bubble, delay) {

    var bubble = this instanceof THREE.Mesh ? this : bubble;
    var delay = delay !== undefined ? delay : _.random(5000, 10000);
    var duration = _.random(5000, 10000);

    bubble.position.x = 0;
    bubble.position.y = 0;
    bubble.position.z = 210;

    function maybe_invert(num) {
        if (_.random(1) === 0) {
            return -num;
        }
        return num;
    }

    var x_target = maybe_invert(_.random($(document).width() * .75, $(document).width()));
    var y_target = maybe_invert(_.random($(document).height() * .75, $(document).height()));
    var z_target = -1500;

    new TWEEN.Tween( bubble )
        .delay( delay )
        .to( {}, duration )
        .onComplete( initBubble )
        .start();

    new TWEEN.Tween( bubble.position )
        .delay( delay )
        .to( { x: x_target, y: y_target, z: z_target}, duration )
        .start();
}


function onWindowResize() {
    var width = $(document).width();
    var height = $(document).height();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}


function onDocumentMouseDown( event ) {
    event.preventDefault();
    WHALE_SONGS[_.random(WHALE_SONGS.length-1)].play();
}


function onDocumentMouseMove( event ) {
    goToMouse(event);
}


function animateThing( fromx, fromy, tox, toy, thingIndex, duration, easing, delay ) {
    setTimeout(function() {
    $({targetX: fromx, targetY: fromy}).animate({targetX: tox, targetY: toy}, {
        duration: duration,
        easing: 'easeOutCubpic',
        step: function() {
            scene.children[0].children[thingIndex].position.x = this.targetX;
            scene.children[0].children[thingIndex].position.y = this.targetY;
        }
    });
    }, delay);
}


function animateThingNoDelay( fromx, fromy, tox, toy, thingIndex, duration, easing) {
    $({targetX: fromx, targetY: fromy}).animate({targetX: tox, targetY: toy}, {
        duration: duration,
        easing: 'easeOutCubic',
        step: function() {
            scene.children[0].children[thingIndex].position.x = this.targetX;
            scene.children[0].children[thingIndex].position.y = this.targetY;
        }
    });
}


function animateWhalePiece(piece, tox, toy) {
    fromx = scene.children[0].children[piece.position_in_scene].position.x;
    fromy = scene.children[0].children[piece.position_in_scene].position.y;
    animateThingNoDelay(fromx, fromy, tox + piece.xoffset, toy + piece.yoffset, piece.position_in_scene, 700, 'swing');
    if (piece.siblings != null) {
        for (var i = 0; i < piece.siblings.length; i++) {
            animateWhalePiece(piece.siblings[i], tox, toy);
        }
    }
    if (piece.next_shape != null) {
        setTimeout(function() {
            animateWhalePiece(piece.next_shape, tox, toy);
        }, piece.next_animate_delay);
    }

}

function goToMouseInner( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    animateWhalePiece(last_piece, mouseX, mouseY);
}

goToMouse = _.throttle(goToMouseInner, 125);

function onDocumentMouseUp( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    animateWhalePiece(last_piece, mouseX, mouseY);
}


function onDocumentMouseOut( event ) {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}


function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

	event.preventDefault();

	mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;

    }

}


function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

	event.preventDefault();

	mouseX = event.touches[ 0 ].pageX - windowHalfX;
	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    }

}


function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}


function render() {
    TWEEN.update();
    renderer.render( scene, camera );
}
