/* tetris v0.4
 * mamikk'08 
 *
 * webgl-port by kvisle'12 */

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <mamikk@mamikk.no> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Martin Mikkelsen
 * ----------------------------------------------------------------------------
 */
function tetrisStart() {
    var self = this;

    self.r = getRenderer();

    self.TETRIS_WIDTH = 10;
    self.TETRIS_HEIGHT = 22;
    self.TETRIS_VISIBLE_HEIGHT = 20;
    self.TETRIS_BLOCK_START_Y = 20;
    self.TETRIS_NUM_BRICKS = 7;

    var box = {
        v : [ 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,   // Front
              1.0, 1.0,-1.0, 0.0, 1.0,-1.0, 0.0, 0.0,-1.0, 1.0, 1.0,-1.0, 0.0, 0.0,-1.0, 1.0, 0.0,-1.0,   // Back
              0.0, 0.0, 0.0, 0.0, 0.0,-1.0, 0.0, 1.0,-1.0, 0.0, 0.0, 0.0, 0.0, 1.0,-1.0, 0.0, 1.0, 0.0,   // Left
              1.0, 0.0, 0.0, 1.0, 0.0,-1.0, 1.0, 1.0,-1.0, 1.0, 0.0, 0.0, 1.0, 1.0,-1.0, 1.0, 1.0, 0.0,   // Right
              1.0, 1.0, 0.0, 1.0, 1.0,-1.0, 0.0, 1.0,-1.0, 1.0, 1.0, 0.0, 0.0, 1.0,-1.0, 0.0, 1.0, 0.0,   // Top
              1.0, 0.0, 0.0, 1.0, 0.0,-1.0, 0.0, 0.0,-1.0, 1.0, 0.0, 0.0, 0.0, 0.0,-1.0, 0.0, 0.0, 0.0 ], // Bottom

        c : [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
              0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7,
              0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 
              0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 
              0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
              0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7 ]

    };

    var wireframe = {
        v : [ 1.0, 1.0,-1.0, 0.0, 1.0,-1.0, 0.0, 0.0,-1.0, 1.0, 0.0,-1.0 ],
        c : [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ]
    };

    self.banner_tetris = [
        "00000 11111 222222 33333 4 55555 6",
        "  0   1       2    3   3 4 5     6",
        "  0   111     2    33333 4 55555 6",
        "  0   1       2    3 3   4     5  ",
        "  0   11111   2    3  33 4 55555 6",
    ];

    self.banner_mamikk = [
        "#   # ##### #   # # #  # #  #",
        "## ## #   # ## ## # # #  # # ",
        "# # # ##### # # # # ##   ##  ",
        "#   # #   # #   # # # #  # # ",
        "#   # #   # #   # # #  # #  #",
    ];

    self.banner_game_over = [
        "11111 11111 1   1 11111",
        "1     1   1 11 11 1    ",
        "1 111 11111 1 1 1 111  ",
        "1   1 1   1 1   1 1    ",
        "11111 1   1 1   1 11111",
        "                       ",
        "22222 2   2 22222 22222",
        "2   2 2   2 2     2   2",
        "2   2  2 2  222   22222",
        "2   2  2 2  2     2 2  ",
        "22222   2   22222 2  22"
    ];


    self.numbers = [
        [
            "#####",
            "#   #",
            "#   #",
            "#   #",
            "#####"
        ],
        [
            "    #",
            "    #",
            "    #",
            "    #",
            "    #"
        ],
        [
            "#####",
            "    #",
            "#####",
            "#    ",
            "#####"
        ],
        [
            "#####",
            "    #",
            "  ###",
            "    #",
            "#####"
        ],
        [
            "#   #",
            "#   #",
            "#####",
            "    #",
            "    #"
        ],
        [
            "#####",
            "#    ",
            "#####",
            "    #",
            "#####"
        ],
        [
            "#####",
            "#    ",
            "#####",
            "#   #",
            "#####"
        ],
        [
            "#####",
            "    #",
            "    #",
            "    #",
            "    #"
        ],
        [
            "#####",
            "#   #",
            "#####",
            "#   #",
            "#####"
        ],
        [
            "#####",
            "#   #",
            "#####",
            "    #",
            "    #"
        ]
    ];


    self.tetris_blocks_rotations = [
        /* I block */
        [
            [
                "    ",
                "####",
                "    ",
                "    "
            ],
            [
                "  # ",
                "  # ",
                "  # ",
                "  # "
            ],
            [
                "    ",
                "    ",
                "####",
                "    "
            ],
            [
                " #  ",
                " #  ",
                " #  ",
                " #  "
            ]
        ],
    
        /* J block */
        [
            [
                "#   ",
                "### ",
                "    ",
                "    "
            ],
            [
                " ## ",
                " #  ",
                " #  ",
                "    "
            ],
            [
                "    ",
                "### ",
                "  # ",
                "    "
            ],
            [
                " #  ",
                " #  ",
                "##  ",
                "    "
            ]
        ],
    
        /* L block */
        [
            [
                "  # ",
                "### ",
                "    ",
                "    "
            ],
            [
                " #  ",
                " #  ",
                " ## ",
                "    "
            ],
            [
                "    ",
                "### ",
                "#   ",
                "    "
            ],
            [
                "##  ",
                " #  ",
                " #  ",
                "    "
            ]
        ],
    
        /* O block */
        [
            [
                " ## ",
                " ## ",
                "    ",
                "    "
            ],
            [
                " ## ",
                " ## ",
                "    ",
                "    "
            ],
            [
                " ## ",
                " ## ",
                "    ",
                "    "
            ],
            [
                " ## ",
                " ## ",
                "    ",
                "    "
            ]
        ],
    
        /* S block */
        [
            [
                " ## ",
                "##  ",
                "    ",
                "    "
            ],
            [
                " #  ",
                " ## ",
                "  # ",
                "    "
            ],
            [
                "    ",
                " ## ",
                "##  ",
                "    "
            ],
            [
                "#   ",
                "##  ",
                " #  ",
                "    "
            ]
        ],
    
        /* T block */
        [
            [
                " #  ",
                "### ",
                "    ",
                "    "
            ],
            [
                " #  ",
                " ## ",
                " #  ",
                "    "
            ],
            [
                "    ",
                "### ",
                " #  ",
                "    "
            ],
            [
                " #  ",
                "##  ",
                " #  ",
                "    "
            ]
        ],
    
        /* Z block */
        [
            [
                "##  ",
                " ## ",
                "    ",
                "    "
            ],
            [
                "  # ",
                " ## ",
                " #  ",
                "    "
            ],
            [
                "    ",
                "##  ",
                " ## ",
                "    "
            ],
            [
                " #  ",
                "##  ",
                "#   ",
                "    "
            ]
        ]
    ];

    self.empty_field = [ [], [], [], [], [], [], [], [], [], [] ];

    self.tetris = {
        field: Array(self.TETRIS_WIDTH), // make sure new_game sets the array.
        next_update: 0.0,
        curblock: 0,
        curblock_x: 0, curblock_y: 0,
        nextblock: 0,
        rotation: 0,
        last_tetris: 0.0,
        score: 0,
        level: 0
    };


    self.colors = {
        black   : [ 0.0, 0.0, 0.0 ],
        red     : [ 1.0, 0.0, 0.0 ],
        green   : [ 0.0, 1.0, 0.0 ],
        blue    : [ 0.0, 0.0, 1.0 ],
        yellow  : [ 1.0, 1.0, 0.0 ],
        magenta : [ 1.0, 0.0, 1.0 ],
        cyan    : [ 0.0, 1.0, 1.0 ],
        white   : [ 1.0, 1.0, 1.0 ],
        orange  : [ 1.0, 0.5, 0.0 ],
        purple  : [ 0.5, 0.0, 0.5 ]
    };
    self.tetris_block_colors = [
        /* I block */ self.colors.cyan,
        /* J block */ self.colors.blue,
        /* L block */ self.colors.orange,
        /* O block */ self.colors.yellow,
        /* S block */ self.colors.green,
        /* T block */ self.colors.purple,
        /* Z block */ self.colors.red
    ];

    self.new_game = function (t) {
        var x, y;

        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            self.tetris.field[x] = Array(self.TETRIS_HEIGHT);
            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                self.tetris.field[x][y] = 0;
            }
        }
        self.tetris.next_update = t;
        self.tetris.curblock = Math.floor(Math.random()*self.TETRIS_NUM_BRICKS);
        self.tetris.curblock_x = (self.TETRIS_WIDTH / 2) - (4 / 2);
        self.tetris.curblock_y = self.TETRIS_BLOCK_START_Y;
        self.tetris.nextblock = Math.floor(Math.random()*self.TETRIS_NUM_BRICKS);
        self.tetris.rotation = 0;
        self.tetris.last_tetris = -100.0;
        self.tetris.score = 0;
        self.tetris.level = 0;
        self.do_reset = false;
    };

    self.field_apply = function (field1, field2) {
        var x, y;
    
        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                if (field2[x][y])
                    field1[x][y] = field2[x][y];
            }
        }
    };

    self.write_block = function(field, i, r, x, y) {
        var px, py;
    
        for (px = 0; px < 4; ++px) {
            for (py = 0; py < 4; ++py) {
                var v = self.tetris_blocks_rotations[i][r][py][px] == '#';
                var tx = x + px;
                var ty = y + py;
                if (v && tx >= 0 && tx < self.TETRIS_WIDTH && ty >= 0 && ty < self.TETRIS_HEIGHT)
                    field[tx][ty] = (i + 1);
            }
        }
    };

    self.valid_block = function(i, r, x, y) {
        var px, py;
        var curblock = [ [], [], [], [], [], [], [], [], [], [] ];
    
        for (px = 0; px < 4; ++px) {
            for (py = 0; py < 4; ++py) {
                var v = self.tetris_blocks_rotations[i][r][py][px] == '#';
                var tx = x + px;
                var ty = y + py;
                if (! v)
                    continue;
                if (v && tx >= 0 && tx < self.TETRIS_WIDTH && ty >= 0 && ty < self.TETRIS_HEIGHT)
                    continue;
                return false;
            }
        }
    
        self.write_block(curblock, i, r, x, y);
        
        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                if (! curblock[x][y]) continue;
                if (self.tetris.field[x][y]) return false;
            }
        }

        return true;
    };

    self.block_landed = function (tetris) {
        var x, y;

        var curblock = [ [], [], [], [], [], [], [], [], [], [] ];
        self.write_block(curblock, tetris.curblock, tetris.rotation, tetris.curblock_x, tetris.curblock_y);
    
        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            if (curblock[x][0]) return true;
        }

        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                if (! tetris.field[x][y]) continue;
                if (curblock[x][y + 1]) return true;
            }
        }
    
        return false;
    };

    self.block_crashed = function () {
        var x, y;
        var curblock = [ [], [], [], [], [], [], [], [], [], [] ];

        self.write_block(curblock, self.tetris.curblock, self.tetris.rotation, self.tetris.curblock_x, self.tetris.curblock_y);

        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                if (! self.tetris.field[x][y]) continue;
                if (curblock[x][y]) return true;
            }
        }

        return false;
    };

    self.check_tetris = function() {
        var ret = 0;

        for (;;) {
            var x, y;
            var allright;

            for (y = 0; y < self.TETRIS_HEIGHT; ++y) {
                allright = true;
                for (x = 0; x < self.TETRIS_WIDTH; ++x) {
                    if (! self.tetris.field[x][y]) allright = false;
                }
                if (allright) break;
            }
            if (!allright) break;

            ++ret;

            for (; y < (self.TETRIS_HEIGHT - 1); ++y) {
                for (x = 0; x < self.TETRIS_WIDTH; ++x) {
                    self.tetris.field[x][y] = self.tetris.field[x][y + 1];
                }
            }

            for (x = 0; x < self.TETRIS_WIDTH; ++x)
                self.tetris.field[x][self.TETRIS_HEIGHT - 1] = 0;
        }

        return ret;
    };

    self.iterate = function (tetris) {
        tetris.curblock_y--;
    };

    /* left: move block left */
    self.key_left = function () {
        if (self.valid_block(self.tetris.curblock, self.tetris.rotation, self.tetris.curblock_x - 1, self.tetris.curblock_y))
            self.tetris.curblock_x--;
    };

    /* right: move block right */
    self.key_right = function () {
        if (self.valid_block(self.tetris.curblock, self.tetris.rotation, self.tetris.curblock_x + 1, self.tetris.curblock_y))
            self.tetris.curblock_x++;
    };

    /* up: rotate block clockwise */
    self.key_up = function () {
        var next_rotation = self.tetris.rotation;
    
        next_rotation++;
        if (next_rotation >= 4) next_rotation = 0;
    
        if (self.valid_block(self.tetris.curblock, next_rotation, self.tetris.curblock_x, self.tetris.curblock_y))
            self.tetris.rotation = next_rotation;
    };
    
    /* down: move block down */
    self.key_down = function () {
        if (! self.block_landed(self.tetris)) self.iterate(self.tetris);
    };
    
    /* space: drop block */
    self.key_space = function () {
        while (! self.block_landed(self.tetris)) self.iterate(self.tetris);
    };


    self.doit = function (t) {
        var is_game_over = false;
        var u;

        if (t >= self.tetris.next_update) {
            if (self.block_landed(self.tetris)) {
                var curblock = [ [], [], [], [], [], [], [], [], [], [] ];
                var nt;
    
                self.write_block(curblock, self.tetris.curblock, self.tetris.rotation, self.tetris.curblock_x, self.tetris.curblock_y);
                self.field_apply(self.tetris.field, curblock);
    
                self.tetris.curblock = self.tetris.nextblock;;
                self.tetris.curblock_x = (self.TETRIS_WIDTH / 2) - (4 / 2);
                self.tetris.curblock_y = self.TETRIS_BLOCK_START_Y;
                self.tetris.nextblock = Math.floor(Math.random()*self.TETRIS_NUM_BRICKS);
                self.tetris.rotation = 0;
    
                nt = self.check_tetris();
                self.tetris.level += nt;
                if (nt == 1) self.tetris.score += 1000;
                if (nt == 2) self.tetris.score += 2000;
                if (nt == 3) self.tetris.score += 4000;
                if (nt == 4) {
                    self.tetris.score += 10000;
                    self.tetris.last_tetris = t;
                }
    
                if (self.block_crashed()) {
                    is_game_over = true;
                }
            } else {
                self.iterate(self.tetris);
            }
            u = 5.0 - Math.log((self.tetris.level / 4) + 1);
            u /= 10.0;
            if (u <= 0.05)
                u = 0.05;
            self.tetris.next_update = t + u;
    
        }
       
        return ! is_game_over;
    };


    self.draw_box = function (color, alpha) {   // TODO: Fix alpha.
        self.r.draw('box', { col: color, a: alpha });
    };

    self.getTicks = function () {
        return (new Date()).getTime();
    };

    self.copy_field = function (dst, src) {
        var x, y;
        for (y = 0; y < self.TETRIS_HEIGHT; y++) {
            for (x = 0; x < self.TETRIS_WIDTH; x++) {
                dst[x][y] = src[x][y];
            }
        }
    };

    self.draw_number = function (n, fmt, color)
    {
        var buf;
        var s;
        buf = fmt.sprintf(n); 
    
        self.r.pushMatrix();
    
        for (s = 0; s < buf.length; ++s) {
            var i = buf.charCodeAt(s) - '0'.charCodeAt(0);
            var x, y;
    
            self.r.pushMatrix();
    
            for (y = 0; y < 5; ++y) {
                self.r.pushMatrix();
                for (x = 0; x < 5; ++x) {
                    if (self.numbers[i][y][x] == '#')
                        self.draw_box(color, 1.0);
                    self.r.translate([1.0, 0.0, 0.0]);
                }
                self.r.popMatrix();
                self.r.translate([0.0, -1.0, 0.0]);
            }
    
            self.r.popMatrix();
            
            self.r.translate([6.0, 0.0, 0.0]);
        }
    
        self.r.popMatrix();
    };

    self.zomg_banner = function (t, xxx) {
        var ffff = false;
        var x, y;

        if (t >= xxx && t <= xxx + 2.0)
            ffff = true;

        self.r.pushMatrix();

        for (y = 0; y < 5; ++y) {
            self.r.pushMatrix();
            for (x = 0; x < 34; ++x) {
                var z;
                var color;
                var n = self.banner_tetris[y][x];
                if (n != ' ') {
                    var ffffcur = false;
                    n -= '0';

                    if (t >= xxx + (n * 0.3) &&
                        t <= xxx + (n * 0.3) + 0.28)
                        ffffcur = true;

                    color = self.tetris_block_colors[n];
                    self.r.pushMatrix();

                    z = Math.cos(t * Math.sin(x) * 5.0) * 0.4;

                    //glTranslated(0.0, 0.0, z);
                    self.r.translate([0.0, z, 0.0]);

                    if (ffffcur) {
                        self.r.translate([0.0, 0.0, 2.0]);
                        self.r.scale([1.5, 1.5, 1.5]);
                    }
    
                    if (! ffff || ffffcur)
                        self.draw_box(color, 1.0);
                    self.r.popMatrix();
                }
                self.r.translate([1.0, 0.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([0.0,-1.0, 0.0]);
        }

        self.r.popMatrix();

    };

    self.zomg_mamikk = function(t) {
        var x, y;

        self.r.pushMatrix();

        //glRotated(t * 100.0, 1.0, 0.0, 0.0);
        self.r.translate([29.0 * 0.5, 5.0 * 0.5, 0.0]);
        self.r.rotate(t * 1.0, [1.0, 1.0, 1.0]);
        self.r.translate([-29.0 * 0.5, -5.0 * 0.5, 0.0]);
    
        for (y = 0; y < 5; ++y) {
            self.r.pushMatrix();
            for (x = 0; x < 29; ++x) {
                if (self.banner_mamikk[y][x] == '#')
                    self.draw_box(self.colors.white, 1.0);
                self.r.translate([1.0, 0.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([0.0, -1.0, 0.0]);
        }
        self.r.popMatrix();
    };

    self.zomg_game_over = function (t) {
        var x, y;
    
        self.r.pushMatrix();
        
        for (y = 0; y < 11; ++y) {
            self.r.pushMatrix();
            for (x = 0; x < 23; ++x) {
                var doit = false;
                var ch = self.banner_game_over[y][x];
                if (t >= 1.0 && ch == '1')
                    doit = true;
                if (t >= 2.0 && (ch == '1' || ch == '2'))
                    doit = true;
                if (doit)
                    self.draw_box(self.colors.white, 1.0);
                self.r.translate([1.0, 0.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([0.0, -1.0, 0.0]);
        }
        self.r.popMatrix();
    };


    self.draw = function (t, draw_ghost) {
        var x, y;
        var i;

        var field = [ [], [], [], [], [], [], [], [], [], [] ];
        var curblock = [ [], [], [], [], [], [], [], [], [], [] ];

        self.write_block(curblock, self.tetris.curblock, self.tetris.rotation, self.tetris.curblock_x, self.tetris.curblock_y);

        self.copy_field(field, self.tetris.field);

        self.field_apply(field, curblock);

        /* tetris logo */
        self.r.pushMatrix();
        self.r.translate([0.0, 20.0, -50.0]);
        self.zomg_banner(t, self.tetris.last_tetris);
        self.r.popMatrix();
    
        /* mamikk logo */
        self.r.pushMatrix();
        self.r.translate([22.0, -25.0, -70.0]);
        self.zomg_mamikk(t);
        self.r.popMatrix();

        /* playfield */
        self.r.pushMatrix();
        self.r.translate([-12.0, -10.0, -20.0]);
        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            self.r.pushMatrix();
            for (y = 0; y < self.TETRIS_VISIBLE_HEIGHT; ++y) {
                var color;
                var v;

                v = field[x][y];
                if (v) {
                    color = self.tetris_block_colors[v - 1];
                    self.draw_box(color, 1.0);
                }
                self.r.translate([0.0, 1.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([1.0, 0.0, 0.0]);
        }
        self.r.popMatrix();

        /* ghost block */
        if (self.draw_ghost) {
            var gtetris = {
                field : [ [], [], [], [], [], [], [], [], [], [] ],
                rotation : self.tetris.rotation,
                curblock : self.tetris.curblock,
                curblock_x: self.tetris.curblock_x,
                curblock_y : self.tetris.curblock_y
            };
            self.copy_field(gtetris.field, self.tetris.field);

            while (! self.block_landed(gtetris)) self.iterate(gtetris);
            self.write_block(curblock, gtetris.curblock, gtetris.rotation, gtetris.curblock_x, gtetris.curblock_y);

            self.r.pushMatrix();
            self.r.translate([-12.0, -10.0, -20.0]);
            for (x = 0; x < self.TETRIS_WIDTH; ++x) {
                self.r.pushMatrix();
                for (y = 0; y < self.TETRIS_VISIBLE_HEIGHT; ++y) {
                    var origcolor;
                    var color = [];
                    var v;

                    v = curblock[x][y];
                    if (v) {
                        origcolor = self.tetris_block_colors[v - 1].slice(0);
                        color[0] = origcolor[0] * 0.2;
                        color[1] = origcolor[1] * 0.2;
                        color[2] = origcolor[2] * 0.2;
                        self.draw_box(color, 0.8);
                    }
                    self.r.translate([0.0, 1.0, 0.0]);
                }
                self.r.popMatrix();
                self.r.translate([1.0, 0.0, 0.0]);
            }
            self.r.popMatrix();
        }

        /* wireframe crap */
        self.r.pushMatrix();
        self.r.translate([-12.0, -10.0, -20.0]);
        for (x = 0; x < self.TETRIS_WIDTH; ++x) {
            self.r.pushMatrix();
            for (y = 0; y < self.TETRIS_VISIBLE_HEIGHT; ++y) {
    
                self.r.draw('wf', { col: self.colors.white, a: 1.0, type: 'LINE_LOOP' });

                self.r.translate([0.0, 1.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([1.0, 0.0, 0.0]);
        }
        self.r.popMatrix();
    
        /* next block */
        i = self.tetris.nextblock;
        self.r.pushMatrix();
        self.r.translate([2.0, -2.0, -15.0]);
        for (x = 0; x < 4; ++x) {
            self.r.pushMatrix();
            for (y = 0; y < 4; ++y) {
                var color = self.tetris_block_colors[i];
                var v = self.tetris_blocks_rotations[i][0][y][x] == '#';
                if (v)
                    self.draw_box(color, 1.0);
                self.r.translate([0.0, 1.0, 0.0]);
            }
            self.r.popMatrix();
            self.r.translate([1.0, 0.0, 0.0]);
        }
        self.r.popMatrix();
    
        /* score */
        self.r.pushMatrix();
        self.r.translate([0.0, 18.0, -80.0]);
        self.draw_number(self.tetris.score, "%010u", self.colors.white);
        self.r.popMatrix();
    };


    self.intro = function (it, t) {
        if ( it >= 1.0 ) {
            self.r.pushMatrix();
            self.r.translate([-17.0, 0.0, -25.0]);
            self.zomg_banner(it, 1.0);
            self.r.popMatrix();
        }

        if ( t >= 4.0 ) {
            self.r.pushMatrix();
            self.r.translate([22.0,-25.0,-70.0]);
            self.zomg_mamikk(t);
            self.r.popMatrix();
        }
    };

    self.game_over = function (it, t, score) {
        self.r.pushMatrix();
        self.r.translate([-23.0 * 0.5, 3.0 + 6.0 + 2.0, -25.0]);
        self.zomg_game_over(it);
        self.r.popMatrix();

        if (it >= 3.0) {
            self.r.pushMatrix();
            self.r.translate([-23.0 * 0.5 - 36.0 * 0.5, 3.0 + 6.0 - 12.0, -50.0]);
            self.draw_number(score, "%010u", self.colors.white);
            self.r.popMatrix();
        }

        /* mamikk logo */
        self.r.pushMatrix();
        self.r.translate([22.0, -25.0, -70.0]);
        self.zomg_mamikk(t);
        self.r.popMatrix();
    };

    self.keydown = function (e) {
        switch(e.keyCode ) {
            case 37: if ( self.game_mode == 'IN_GAME' ) self.key_left();  break;
            case 39: if ( self.game_mode == 'IN_GAME' ) self.key_right(); break;
            case 38: if ( self.game_mode == 'IN_GAME' ) self.key_up();    break;
            case 40: if ( self.game_mode == 'IN_GAME' ) self.key_down();  break;
            case 32: if ( self.game_mode == 'IN_GAME' ) self.key_space(); break;
            case 71: self.draw_ghost = !self.draw_ghost; break;
            case 80:
                if ( self.game_mode == 'IN_GAME' ) {
                    self.game_mode = 'PAUSE';
                    self.pause_start = self.cur_timer;
                } else if ( self.game_mode == 'PAUSE' ) {
                    self.game_mode = 'IN_GAME';
                    self.tetris.next_update = self.cur_timer - self.pause_start;
                }
                break;
            case 82: if ( self.game_mode == 'IN_GAME' ) self.do_reset = true; break;
        }
    };

    self.keyup = function (e) {
    };

    self.r.initBuffer("box", box);
    self.r.initBuffer("wf", wireframe);
    self.framecount = 0,
    self.fps = 0.0,
    self.cur_timer = 0.0,
    self.intro_start = 0.0,
    self.game_over_start = 0.0,
    self.pause_start = 0.0,
    self.draw_ghost = false,
    self.game_mode = 'INTRO';
    self.ticks_start = self.ticks_prev = self.getTicks();
    self.do_reset = false;

    self.loop = function () {
        var ticks_now, ticks_diff;

        // TODO: Check input

        ticks_now = self.getTicks();
        ticks_diff = ticks_now - self.ticks_start;
        self.cur_timer = ticks_diff / 1000.0;

        if (self.game_mode == 'INTRO' && self.cur_timer >= (self.intro_start + 5.0))
            self.do_reset = true;
        
        if (self.game_mode == 'GAME_OVER' && self.cur_timer >= (self.game_over_start + 5.0)) {
            self.game_mode = 'INTRO';
            self.intro_start = self.cur_timer;
        }

        if (self.do_reset) {
            self.game_mode = 'IN_GAME';
            self.new_game(self.cur_timer + 1.0);
        }

        if (self.game_mode == 'IN_GAME') {
            if (! self.doit(self.cur_timer)) {
                self.game_mode = 'GAME_OVER';
                self.game_over_start = self.cur_timer;
            }
        }

        self.r.clear();      

        /* Drawing */
        if ( self.game_mode == 'IN_GAME' || self.game_mode == 'PAUSE' ) {
            self.draw(self.cur_timer, self.draw_ghost);
        } else if ( self.game_mode == 'INTRO' ) {
            self.intro(self.cur_timer - self.intro_start, self.cur_timer);
        } else {
            self.game_over(self.cur_timer - self.game_over_start, self.cur_timer, self.tetris.score);
        }

        ++self.framecount;

/*        if (ticks_now >= (ticks_prev + 1000)) {
            fps = (double)framecount / ((double)(ticks_now - ticks_prev) / 1000.0);
            ticks_prev = ticks_now;
            framecount = 0;

            set_caption(cur_timer, fps);
        }*/

    };

    self.startLoop = function () {
        setInterval(self.loop, 33);
    };

    self.getGameMode = function () {
        console.log(self.game_mode);
    };
}

var game;

function start() {
    game = new tetrisStart();
    game.startLoop();
};
