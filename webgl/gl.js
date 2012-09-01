function getRenderer() {
    this.buffers = {};
    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.shaderProgram = undefined;

    this.setContext = function (canvas) {
        try {
            this.gl = this.canvas.getContext("experimental-webgl");
            this.gl.viewportWidth = this.canvas.width;
            this.gl.viewportHeight = this.canvas.height;
        } catch(e) {
    
        }
        if (!this.gl) {
            alert("Could not initialize WebGL, sorry :-(");
            return;
        }
    };

    this.getShader = function(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
    
        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3)
                str += k.textContent;
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    };

    this.initShaders = function () {
        var fs = getShader(gl, "shader-fs");
        var vs = getShader(gl, "shader-vs");

        var sp = gl.createProgram();
        gl.attachShader(sp, vs);
        gl.attachShader(sp, fs);
        gl.linkProgram(sp);

        if ( !gl.getProgramParameter(sp, gl.LINK_STATUS) ) {
            alert("Could not initialize shaders");
        }
        gl.useProgram(sp);


        sp.vp = gl.getAttribLocation(sp, "aVertexPosition");
        gl.enableVertexAttribArray(sp.vp);

        sp.cp = gl.getAttribLocation(sp, "aColor");
        gl.enableVertexAttribArray(sp.cp);

        sp.cu = gl.getUniformLocation(sp, "uColor");
//        gl.enableVertexAttribArray(sp.cu);

        sp.pMatrixUniform = gl.getUniformLocation(sp, "uPMatrix");
        sp.mvMatrixUniform = gl.getUniformLocation(sp, "uMVMatrix");

        return sp;
    };

    this.clearBuffer = function (name) {
        if ( isBuffer(this.buffers[name].v) )
            gl.deleteBuffer(this.buffers[name].v);

        if ( isBuffer(this.buffers[name].n) )
            gl.deleteBuffer(this.buffers[name].n);

        if ( isBuffer(this.buffers[name].c) )
            gl.deleteBuffer(this.buffers[name].c);

        if ( isBuffer(this.buffers[name].t) )
            gl.deleteBuffer(this.buffers[name].t);

        delete this.buffers[name];
    };

    this.initBuffer = function (name, obj) {
        if ( this.buffers[name] )
            clearBuffer(name);

        var buffertypes = ['v','c','n','t'];

        var bufs = {};

        buffertypes.forEach(function(bt) {
            if ( obj[bt] ) {
                bufs[bt] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, bufs[bt]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj[bt]), gl.STATIC_DRAW);
                bufs[bt].itemSize = 3;
                bufs[bt].numItems = obj[bt].length / 3;
            }
        });
        this.buffers[name] = bufs;
    };

    this.clear = function () {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
    };

    this.draw = function (name, obj) {
        var white = [ 1.0, 1.0, 1.0 ];
        var type = gl.TRIANGLES;

        if ( obj.col ) {
            gl.uniform3f(this.shaderProgram.cu, obj.col[0], obj.col[1], obj.col[2]);
        }
        else {
            gl.uniform3f(this.shaderProgram.cu, white[0], white[1], white[2]);
        }

        if ( obj.type != undefined ) {
            var type = gl[obj.type];
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name].v);
        gl.vertexAttribPointer(this.shaderProgram.vp, buffers[name].v.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name].c);
        gl.vertexAttribPointer(this.shaderProgram.cp, buffers[name].c.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();

        gl.drawArrays( type, 0, buffers[name].v.numItems);
    };

    this.setMatrixUniforms = function () {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    };

    this.pushMatrix = function () {
        mat4.push(mvMatrix);
    };

    this.popMatrix = function () {
        mat4.pop(mvMatrix);
    };

    this.translate = function (p) {
        mat4.translate(mvMatrix, p);
    };

    this.scale = function (p) {
        mat4.scale(mvMatrix, p);
    };

    this.rotate = function (r, arr) {
        mat4.rotate(mvMatrix, r, arr);
    };

    this.canvas = document.getElementById("gl");
    setContext(canvas);
    console.log("renderer: Initialized WebGL");

    this.shaderProgram = initShaders();
    console.log("renderer: Compiled shaders");


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    return this;
}
