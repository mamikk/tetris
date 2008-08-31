/* tetris v0.3
 * mamikk'08 */

#define NAME    "tetris (created by: mamikk)"
#define VERSION "v0.3"

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <mamikk@mamikk.no> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.   Martin Mikkelsen
 * ----------------------------------------------------------------------------
 */

#include <stddef.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include <math.h>
#include <SDL.h>
#include <GL/gl.h>
#include <GL/glu.h>

#if 0
int rand(void) { return 0; }
#endif

static const unsigned int width = 800;
static const unsigned int height = 600;

#define TETRIS_WIDTH 10
#define TETRIS_HEIGHT 22
#define TETRIS_VISIBLE_HEIGHT 20
#define TETRIS_BLOCK_START_Y 20
#define TETRIS_NUM_BRICKS 7

static const char banner_tetris[5][34] = {
    "00000 11111 222222 33333 4 55555 6",
    "  0   1       2    3   3 4 5     6",
    "  0   111     2    33333 4 55555 6",
    "  0   1       2    3 3   4     5  ",
    "  0   11111   2    3  33 4 55555 6",
};

static const char banner_mamikk[5][29] = {
    "#   # ##### #   # # #  # #  #",
    "## ## #   # ## ## # # #  # # ",
    "# # # ##### # # # # ##   ##  ",
    "#   # #   # #   # # # #  # # ",
    "#   # #   # #   # # #  # #  #",
};

static const char banner_game_over[11][23] = {
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
};

static const char numbers[10][5][5] = {
    {
        "#####",
        "#   #",
        "#   #",
        "#   #",
        "#####"
    },
    {
        "    #",
        "    #",
        "    #",
        "    #",
        "    #"
    },
    {
        "#####",
        "    #",
        "#####",
        "#    ",
        "#####"
    },
    {
        "#####",
        "    #",
        "  ###",
        "    #",
        "#####"
    },
    {
        "#####",
        "#   #",
        "#####",
        "    #",
        "    #"
    },
    {
        "#####",
        "#    ",
        "#####",
        "    #",
        "#####"
    },
    {
        "#####",
        "#    ",
        "#####",
        "#   #",
        "#####"
    },
    {
        "#####",
        "    #",
        "    #",
        "    #",
        "    #"
    },
    {
        "#####",
        "#   #",
        "#####",
        "#   #",
        "#####"
    },
    {
        "#####",
        "#   #",
        "#####",
        "    #",
        "    #"
    }
};

struct color_rgb {
    double r;
    double g;
    double b;
};

#define COLOR_HEX(r) ((double)r / 255.0)
#define RGB_HEX(r, g, b) { COLOR_HEX(r), COLOR_HEX(g), COLOR_HEX(b) }

static const struct color_rgb color_rgb_black =     RGB_HEX(0x00, 0x00, 0x00);
static const struct color_rgb color_rgb_red =       RGB_HEX(0xff, 0x00, 0x00);
static const struct color_rgb color_rgb_green =     RGB_HEX(0x00, 0xff, 0x00);
static const struct color_rgb color_rgb_blue =      RGB_HEX(0x00, 0x00, 0xff);
static const struct color_rgb color_rgb_yellow =    RGB_HEX(0xff, 0xff, 0x00);
static const struct color_rgb color_rgb_magenta =   RGB_HEX(0xff, 0x00, 0xff);
static const struct color_rgb color_rgb_cyan =      RGB_HEX(0x00, 0xff, 0xff);
static const struct color_rgb color_rgb_white =     RGB_HEX(0xff, 0xff, 0xff);

static const struct color_rgb color_rgb_orange =    RGB_HEX(0xff, 0x7f, 0x00);
static const struct color_rgb color_rgb_purple =    RGB_HEX(0x80, 0x00, 0x80);

#undef COLOR_HEX
#undef RGB_HEX

/* blocks: */
/* I, J, L, O, S, T, and Z */

static const struct color_rgb *tetris_block_colors[TETRIS_NUM_BRICKS] = {
    /* I block */ &color_rgb_cyan,
    /* J block */ &color_rgb_blue,
    /* L block */ &color_rgb_orange,
    /* O block */ &color_rgb_yellow,
    /* S block */ &color_rgb_green,
    /* T block */ &color_rgb_purple,
    /* Z block */ &color_rgb_red,
};

struct tetris_block_rotations {
    const char rotations[4][4][4];
};

static const struct tetris_block_rotations tetris_blocks_rotations[TETRIS_NUM_BRICKS] = {
    /* I block */
    {
        {
            {
                "    ",
                "####",
                "    ",
                "    "
            },
            {
                "  # ",
                "  # ",
                "  # ",
                "  # "
            },
            {
                "    ",
                "    ",
                "####",
                "    "
            },
            {
                " #  ",
                " #  ",
                " #  ",
                " #  "
            }
        }
    },

    /* J block */
    {
        {
            {
                "#   ",
                "### ",
                "    ",
                "    "
            },
            {
                " ## ",
                " #  ",
                " #  ",
                "    "
            },
            {
                "    ",
                "### ",
                "  # ",
                "    "
            },
            {
                " #  ",
                " #  ",
                "##  ",
                "    "
            }
        }
    },

    /* L block */
    {
        {
            {
                "  # ",
                "### ",
                "    ",
                "    "
            },
            {
                " #  ",
                " #  ",
                " ## ",
                "    "
            },
            {
                "    ",
                "### ",
                "#   ",
                "    "
            },
            {
                "##  ",
                " #  ",
                " #  ",
                "    "
            }
        }
    },

    /* O block */
    {
        {
            {
                " ## ",
                " ## ",
                "    ",
                "    "
            },
            {
                " ## ",
                " ## ",
                "    ",
                "    "
            },
            {
                " ## ",
                " ## ",
                "    ",
                "    "
            },
            {
                " ## ",
                " ## ",
                "    ",
                "    "
            },
        }
    },

    /* S block */
    {
        {
            {
                " ## ",
                "##  ",
                "    ",
                "    "
            },
            {
                " #  ",
                " ## ",
                "  # ",
                "    "
            },
            {
                "    ",
                " ## ",
                "##  ",
                "    "
            },
            {
                "#   ",
                "##  ",
                " #  ",
                "    "
            }
        }
    },

    /* T block */
    {
        {
            {
                " #  ",
                "### ",
                "    ",
                "    "
            },
            {
                " #  ",
                " ## ",
                " #  ",
                "    "
            },
            {
                "    ",
                "### ",
                " #  ",
                "    "
            },
            {
                " #  ",
                "##  ",
                " #  ",
                "    "
            }
        }
    },

    /* Z block */
    {
        {
            {
                "##  ",
                " ## ",
                "    ",
                "    "
            },
            {
                "  # ",
                " ## ",
                " #  ",
                "    "
            },
            {
                "    ",
                "##  ",
                " ## ",
                "    "
            },
            {
                " #  ",
                "##  ",
                "#   ",
                "    "
            }
        }
    }
};

typedef int tetris_field[TETRIS_WIDTH][TETRIS_HEIGHT];

struct tetris {
    tetris_field field;
    double next_update;
    int curblock;
    int curblock_x, curblock_y;
    int nextblock;
    int rotation;
    double last_tetris;
    unsigned int score;
    unsigned int level;
};

static void new_game(struct tetris *tetris, double t)
{
    int x, y;

    memset(tetris, '\x7f', sizeof(*tetris)); /* to catch missing init fields. */

    for (x = 0; x < TETRIS_WIDTH; ++x) {
        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            tetris->field[x][y] = 0;
        }
    }

    tetris->next_update = t;

    tetris->curblock = rand() % TETRIS_NUM_BRICKS;
    tetris->curblock_x = (TETRIS_WIDTH / 2) - (4 / 2);
    tetris->curblock_y = TETRIS_BLOCK_START_Y;
    tetris->nextblock = rand() % TETRIS_NUM_BRICKS;
    tetris->rotation = 0;
    tetris->last_tetris = -100.0;
    tetris->score = 0;
    tetris->level = 0;
}

static void field_apply(tetris_field field1, tetris_field field2)
{
    int x, y;

    for (x = 0; x < TETRIS_WIDTH; ++x) {
        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            if (field2[x][y])
                field1[x][y] = field2[x][y];
        }
    }
}

static void write_block(tetris_field field, int i, int r, int x, int y)
{
    int px, py;

    for (px = 0; px < 4; ++px) {
        for (py = 0; py < 4; ++py) {
            int v = tetris_blocks_rotations[i].rotations[r][py][px] == '#';
            int tx = x + px;
            int ty = y + py;
            if (v && tx >= 0 && tx < TETRIS_WIDTH && ty >= 0 && ty < TETRIS_HEIGHT)
                field[tx][ty] = (i + 1);
        }
    }
}

static bool valid_block(tetris_field tstfield, int i, int r, int x, int y)
{
    int px, py;
    tetris_field curblock = { { 0 } };

    for (px = 0; px < 4; ++px) {
        for (py = 0; py < 4; ++py) {
            int v = tetris_blocks_rotations[i].rotations[r][py][px] == '#';
            int tx = x + px;
            int ty = y + py;
            if (! v)
                continue;
            if (v && tx >= 0 && tx < TETRIS_WIDTH && ty >= 0 && ty < TETRIS_HEIGHT)
                continue;
            return false;
        }
    }
    
    write_block(curblock, i, r, x, y);
    
    for (x = 0; x < TETRIS_WIDTH; ++x) {
        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            if (! curblock[x][y]) continue;
            if (tstfield[x][y]) return false;
        }
    }

    return true;
}

static bool block_landed(struct tetris *tetris)
{
    int x, y;

    tetris_field curblock = { { 0 } };

    write_block(curblock, tetris->curblock, tetris->rotation, tetris->curblock_x, tetris->curblock_y);

    for (x = 0; x < TETRIS_WIDTH; ++x) {
        if (curblock[x][0]) return true;
    }

    for (x = 0; x < TETRIS_WIDTH; ++x) {
        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            if (! tetris->field[x][y]) continue;
            if (curblock[x][y + 1]) return true;
        }
    }

    return false;
}

static bool block_crashed(struct tetris *tetris)
{
    int x, y;

    tetris_field curblock = { { 0 } };

    write_block(curblock, tetris->curblock, tetris->rotation, tetris->curblock_x, tetris->curblock_y);

    for (x = 0; x < TETRIS_WIDTH; ++x) {
        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            if (! tetris->field[x][y]) continue;
            if (curblock[x][y]) return true;
        }
    }

    return false;
}

static int check_tetris(struct tetris *tetris)
{
    int ret = 0;

    for (;;) {
        int x, y;

        for (y = 0; y < TETRIS_HEIGHT; ++y) {
            bool allright = true;
            for (x = 0; x < TETRIS_WIDTH; ++x) {
                if (! tetris->field[x][y]) allright = false;
            }
            if (allright) goto doit;
        }
        break;

        doit:
        ++ret;

        for (; y < (TETRIS_HEIGHT - 1); ++y) {
            for (x = 0; x < TETRIS_WIDTH; ++x) {
                tetris->field[x][y] = tetris->field[x][y + 1];
            }
        }

        for (x = 0; x < TETRIS_WIDTH; ++x)
            tetris->field[x][TETRIS_HEIGHT - 1] = 0;
    }

    return ret;
}

static void iterate(struct tetris *tetris)
{
    tetris->curblock_y--;
}

/* left: move block left */
static void key_left(struct tetris *tetris)
{
    if (valid_block(tetris->field, tetris->curblock, tetris->rotation, tetris->curblock_x - 1, tetris->curblock_y))
        tetris->curblock_x--;
}

/* right: move block right */
static void key_right(struct tetris *tetris)
{
    if (valid_block(tetris->field, tetris->curblock, tetris->rotation, tetris->curblock_x + 1, tetris->curblock_y))
        tetris->curblock_x++;
}

/* up: rotate block clockwise */
static void key_up(struct tetris *tetris)
{
    int next_rotation = tetris->rotation;

    next_rotation++;
    if (next_rotation >= 4) next_rotation = 0;

    if (valid_block(tetris->field, tetris->curblock, next_rotation, tetris->curblock_x, tetris->curblock_y))
        tetris->rotation = next_rotation;
}

/* down: move block down */
static void key_down(struct tetris *tetris)
{
    if (! block_landed(tetris)) iterate(tetris);
}

/* space: drop block */
static void key_space(struct tetris *tetris)
{
    while (! block_landed(tetris)) iterate(tetris);
}

static bool doit(struct tetris *tetris, double t)
{
    bool is_game_over = false;
    double u;

    if (t >= tetris->next_update) {
        if (block_landed(tetris)) {
            tetris_field curblock = { { 0 } };
            int nt;

            write_block(curblock, tetris->curblock, tetris->rotation, tetris->curblock_x, tetris->curblock_y);
            field_apply(tetris->field, curblock);

            tetris->curblock = tetris->nextblock;;
            tetris->curblock_x = (TETRIS_WIDTH / 2) - (4 / 2);
            tetris->curblock_y = TETRIS_BLOCK_START_Y;
            tetris->nextblock = rand() % TETRIS_NUM_BRICKS;
            tetris->rotation = 0;

            nt = check_tetris(tetris);
            tetris->level += nt;
            if (nt == 1) tetris->score += 1000;
            if (nt == 2) tetris->score += 2000;
            if (nt == 3) tetris->score += 4000;
            if (nt == 4) {
                tetris->score += 10000;
                tetris->last_tetris = t;
            }

            if (block_crashed(tetris)) {
                is_game_over = true;
            }
        } else {
            iterate(tetris);
        }
        u = 5.0 - log((double)( (tetris->level / 4) + 1));
        u /= 10.0;
        if (u <= 0.05)
            u = 0.05;
        tetris->next_update = t + u;

    }
   
    return ! is_game_over;
}

static void draw_box(struct color_rgb color, double alpha)
{
    glPushMatrix();

    /* front */
    glColor4d(color.r * 1.0, color.g * 1.0, color.b * 1.0, alpha);

    glBegin(GL_QUADS);

    glVertex3d(1.0, 1.0, 0.0);
    glVertex3d(0.0, 1.0, 0.0);
    glVertex3d(0.0, 0.0, 0.0);
    glVertex3d(1.0, 0.0, 0.0);

    glEnd();

    /* back */
    glColor4d(color.r * 0.7, color.g * 0.7, color.b * 0.7, alpha);

    glBegin(GL_QUADS);

    glVertex3d(1.0, 1.0, -1.0);
    glVertex3d(0.0, 1.0, -1.0);
    glVertex3d(0.0, 0.0, -1.0);
    glVertex3d(1.0, 0.0, -1.0);

    glEnd();
    
    /* left */
    glColor4d(color.r * 0.7, color.g * 0.7, color.b * 0.7, alpha);

    glBegin(GL_QUADS);

    glVertex3d(0.0, 0.0, 0.0);
    glVertex3d(0.0, 0.0, -1.0);
    glVertex3d(0.0, 1.0, -1.0);
    glVertex3d(0.0, 1.0, 0.0);

    glEnd();
    
    /* right */
    glColor4d(color.r * 0.7, color.g * 0.7, color.b * 0.7, alpha);

    glBegin(GL_QUADS);

    glVertex3d(1.0, 0.0, 0.0);
    glVertex3d(1.0, 0.0, -1.0);
    glVertex3d(1.0, 1.0, -1.0);
    glVertex3d(1.0, 1.0, 0.0);
    
    glEnd();

    /* top */
    glColor4d(color.r * 0.8, color.g * 0.8, color.b * 0.8, alpha);

    glBegin(GL_QUADS);

    glVertex3d(1.0, 1.0, 0.0);
    glVertex3d(1.0, 1.0, -1.0);
    glVertex3d(0.0, 1.0, -1.0);
    glVertex3d(0.0, 1.0, 0.0);
    
    glEnd();
   
    /* bottom */
    glColor4d(color.r * 0.7, color.g * 0.7, color.b * 0.7, alpha);

    glBegin(GL_QUADS);

    glVertex3d(1.0, 0.0, 0.0);
    glVertex3d(1.0, 0.0, -1.0);
    glVertex3d(0.0, 0.0, -1.0);
    glVertex3d(0.0, 0.0, 0.0);
    
    glEnd();

    glPopMatrix();
}

static void draw_number(unsigned int n, const char *fmt, struct color_rgb color)
{
    char buf[64];
    char *s;

    snprintf(buf, sizeof(buf), fmt, n);

    glPushMatrix();

    for (s = buf; *s; ++s) {
        int i = *s - '0';
        int x, y;

        glPushMatrix();

        for (y = 0; y < 5; ++y) {
            glPushMatrix();
            for (x = 0; x < 5; ++x) {
                if (numbers[i][y][x] == '#')
                    draw_box(color, 1.0);
                glTranslated(1.0, 0.0, 0.0);
            }
            glPopMatrix();
            glTranslated(0.0, -1.0, 0.0);
        }

        glPopMatrix();
        
        glTranslated(6.0, 0.0, 0.0);
    }

    glPopMatrix();
}

static void zomg_banner(double t, double xxx)
{
    bool ffff = false;
    int x, y;

    if (t >= xxx && t <= xxx + 2.0)
        ffff = true;

    glPushMatrix();

    for (y = 0; y < 5; ++y) {
        glPushMatrix();
        for (x = 0; x < 34; ++x) {
            double z;
            const struct color_rgb *color;
            int n = banner_tetris[y][x];
            if (n != ' ') {
                bool ffffcur = false;
                n -= '0';

                if (t >= xxx + ((double)n * 0.3) &&
                    t <= xxx + ((double)n * 0.3) + 0.28)
                    ffffcur = true;

                color = tetris_block_colors[n];
                glPushMatrix();

                z = cos(t * sin(x) * 5.0) * 0.4;

                //glTranslated(0.0, 0.0, z);
                glTranslated(0.0, z, 0.0);

                if (ffffcur) {
                    glTranslated(0.0, 0.0, 2.0);
                    glScaled(1.5, 1.5, 1.5);
                }

                if (! ffff || ffffcur)
                    draw_box(*color, 1.0);
                glPopMatrix();
            }
            glTranslated(1.0, 0.0, 0.0);
        }
        glPopMatrix();
        glTranslated(0.0, -1.0, 0.0);
    }

    glPopMatrix();
}

static void zomg_mamikk(double t)
{
    int x, y;

    glPushMatrix();

    //glRotated(t * 100.0, 1.0, 0.0, 0.0);
    glTranslated(29.0 * 0.5, 5.0 * 0.5, 0.0);
    glRotated(t * 50.0, 1.0, 1.0, 1.0);
    glTranslated(-29.0 * 0.5, -5.0 * 0.5, 0.0);
    
    for (y = 0; y < 5; ++y) {
        glPushMatrix();
        for (x = 0; x < 29; ++x) {
            if (banner_mamikk[y][x] == '#')
                draw_box(color_rgb_white, 1.0);
            glTranslated(1.0, 0.0, 0.0);
        }
        glPopMatrix();
        glTranslated(0.0, -1.0, 0.0);
    }
    glPopMatrix();
}

static void zomg_game_over(double t)
{
    int x, y;

    glPushMatrix();
    
    for (y = 0; y < 11; ++y) {
        glPushMatrix();
        for (x = 0; x < 23; ++x) {
            bool doit = false;
            int ch = banner_game_over[y][x];
            if (t >= 1.0 && ch == '1')
                doit = true;
            if (t >= 2.0 && (ch == '1' || ch == '2'))
                doit = true;
            if (doit)
                draw_box(color_rgb_white, 1.0);
            glTranslated(1.0, 0.0, 0.0);
        }
        glPopMatrix();
        glTranslated(0.0, -1.0, 0.0);
    }
    glPopMatrix();
}

static void draw(struct tetris *tetris, double t, bool draw_ghost)
{
    int x, y;
    int i;

    tetris_field field = { { 0 } };
    tetris_field curblock = { { 0 } };

    write_block(curblock, tetris->curblock, tetris->rotation, tetris->curblock_x, tetris->curblock_y);
    memcpy(field, tetris->field, sizeof(field));
    field_apply(field, curblock);

#if 0
    printf("==========\n");
    for (y = (TETRIS_VISIBLE_HEIGHT - 1); y >= 0; --y) {
        for (x = 0; x < TETRIS_WIDTH; ++x) {
            int v = curblock[x][y];
            putchar(v ? '#' : ' ');
        }
        puts("");
    }
    printf("==========\n");
#endif

//    t += 2.0;
//    glRotated(t * 100.0, 1.0, 0.5, 0.25);

    /* tetris logo */
    glPushMatrix();
    glTranslated(0.0, 20.0, -50.0);
    zomg_banner(t, tetris->last_tetris);
    glPopMatrix();
    
    /* mamikk logo */
    glPushMatrix();
    glTranslated(22.0, -25.0, -70.0);
    zomg_mamikk(t);
    glPopMatrix();

    /* playfield */
    glPushMatrix();
    glTranslated(-12.0, -10.0, -20.0);
    for (x = 0; x < TETRIS_WIDTH; ++x) {
        glPushMatrix();
        for (y = 0; y < TETRIS_VISIBLE_HEIGHT; ++y) {
            const struct color_rgb *color;
            int v;

            v = field[x][y];
            if (v) {
                color = tetris_block_colors[v - 1];
                draw_box(*color, 1.0);
            }
            glTranslated(0.0, 1.0, 0.0);
        }
        glPopMatrix();
        glTranslated(1.0, 0.0, 0.0);
    }
    glPopMatrix();

    /* ghost block */
    if (draw_ghost) {
        struct tetris gtetris;

        memcpy(&gtetris, tetris, sizeof(*tetris));

        while (! block_landed(&gtetris)) iterate(&gtetris);
        write_block(curblock, gtetris.curblock, gtetris.rotation, gtetris.curblock_x, gtetris.curblock_y);

        glPushMatrix();
        glTranslated(-12.0, -10.0, -20.0);
        for (x = 0; x < TETRIS_WIDTH; ++x) {
            glPushMatrix();
            for (y = 0; y < TETRIS_VISIBLE_HEIGHT; ++y) {
                const struct color_rgb *origcolor;
                struct color_rgb color;
                int v;

                v = curblock[x][y];
                if (v) {
                    origcolor = tetris_block_colors[v - 1];
                    color.r = origcolor->r * 0.2;
                    color.g = origcolor->g * 0.2;
                    color.b = origcolor->b * 0.2;
                    draw_box(color, 0.8);
                }
                glTranslated(0.0, 1.0, 0.0);
            }
            glPopMatrix();
            glTranslated(1.0, 0.0, 0.0);
        }
        glPopMatrix();
    }

    /* wireframe crap */
    glPushMatrix();
    glTranslated(-12.0, -10.0, -20.0);
    for (x = 0; x < TETRIS_WIDTH; ++x) {
        glPushMatrix();
        for (y = 0; y < TETRIS_VISIBLE_HEIGHT; ++y) {
    
            glColor3d(color_rgb_white.r, color_rgb_white.g, color_rgb_white.b);

            glBegin(GL_LINE_LOOP);

            glVertex3d(1.0, 1.0, -1.0);
            glVertex3d(0.0, 1.0, -1.0);
            glVertex3d(0.0, 0.0, -1.0);
            glVertex3d(1.0, 0.0, -1.0);

            glEnd();

            glTranslated(0.0, 1.0, 0.0);
        }
        glPopMatrix();
        glTranslated(1.0, 0.0, 0.0);
    }
    glPopMatrix();
    
    /* next block */
    i = tetris->nextblock;
    glPushMatrix();
    glTranslated(2.0, -2.0, -15.0);
    for (x = 0; x < 4; ++x) {
        glPushMatrix();
        for (y = 0; y < 4; ++y) {
            const struct color_rgb *color = tetris_block_colors[i];
            int v = tetris_blocks_rotations[i].rotations[0][y][x] == '#';
            if (v)
                draw_box(*color, 1.0);
            glTranslated(0.0, 1.0, 0.0);
        }
        glPopMatrix();
        glTranslated(1.0, 0.0, 0.0);
    }
    glPopMatrix();
    
    /* score */
    glPushMatrix();
    glTranslated(0.0, 18.0, -80.0);
    draw_number(tetris->score, "%010u", color_rgb_white);
    glPopMatrix();
}

static void intro(double it, double t)
{

    if (it >= 1.0) {
        glPushMatrix();
        glTranslated(-17.0, 0.0, -25.0);
        zomg_banner(it, 1.0);
        glPopMatrix();
    }
    
    if (t >= 4.0) {
        /* mamikk logo */
        glPushMatrix();
        glTranslated(22.0, -25.0, -70.0);
        zomg_mamikk(t);
        glPopMatrix();
    }
}

static void game_over(double it, double t, unsigned int score) {

    glPushMatrix();
    glTranslated(-23.0 * 0.5, 3.0 + 6.0 + 2.0, -25.0);
    zomg_game_over(it);
    glPopMatrix();

    if (it >= 3.0) {
        glPushMatrix();
        glTranslated(-23.0 * 0.5 - 36.0 * 0.5, 3.0 + 6.0 - 12.0, -50.0);
        draw_number(score, "%010u", color_rgb_white);
        glPopMatrix();
    }

    /* mamikk logo */
    glPushMatrix();
    glTranslated(22.0, -25.0, -70.0);
    zomg_mamikk(t);
    glPopMatrix();
}

static void set_caption(double t, double fps)
{
    char buf[128];

    (void)t;
    (void)fps;

#ifdef DEBUG
    snprintf(buf, sizeof(buf), NAME " " VERSION " [t=%.0f, fps=%.0f]", t, fps);
#else
    snprintf(buf, sizeof(buf), NAME " " VERSION);
#endif

    SDL_WM_SetCaption(buf, NULL);
}

int main(int argc, char *argv[])
{
    const SDL_VideoInfo *video_info;
    SDL_Surface *video;
    uint32_t ticks_start, ticks_prev;
    unsigned int framecount = 0;
    double fps = 0.0;
    double cur_timer = 0.0;
    static struct tetris tetris;
    enum { INTRO, IN_GAME, GAME_OVER, PAUSE } game_mode = INTRO;
    double intro_start = 0.0;
    double game_over_start = 0.0;
    double pause_start = 0.0;
    bool draw_ghost = false;

    (void)argc;
    (void)argv;

    srand(time(NULL));
    
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_TIMER) == -1) {
        fprintf(stderr, "SDL_Init: %s\n", SDL_GetError());
        exit(EXIT_FAILURE);
    }

    video_info = SDL_GetVideoInfo();
    if (! video_info) {
        fprintf(stderr, "SDL_GetVideoInfo: %s\n", SDL_GetError());
        exit(EXIT_FAILURE);
    }

    SDL_GL_SetAttribute(SDL_GL_RED_SIZE, 5);
    SDL_GL_SetAttribute(SDL_GL_GREEN_SIZE, 5);
    SDL_GL_SetAttribute(SDL_GL_BLUE_SIZE, 5);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 16);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);

    video = SDL_SetVideoMode(width, height, 32, SDL_OPENGL);
    if (! video) {
        fprintf(stderr, "SDL_SetVideoInfo: %s\n", SDL_GetError());
        exit(EXIT_FAILURE);
    }

    set_caption(cur_timer, fps);
    SDL_ShowCursor(SDL_DISABLE);

    glViewport(0, 0, width, height);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60.0, (double)width / (double)height, 0.1, 100.0);

    glMatrixMode(GL_MODELVIEW);
    //glClearColor(0.75, 0.75, 0.75, 0);
    glClearColor(0.0, 0.0, 0.0, 0);
    glEnable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);

    ticks_start = ticks_prev = SDL_GetTicks();

    for (;;) {
        SDL_Event event;
        bool do_quit = false;
        bool do_reset = false;
        uint32_t ticks_now, ticks_diff;

        while (SDL_PollEvent(&event)) {
            switch (event.type) {
                case SDL_KEYDOWN:
                    switch (event.key.keysym.sym) {
                        case SDLK_ESCAPE:
                        case SDLK_q:
                            do_quit = true;
                            break;
                        case SDLK_BACKSPACE:
                        case SDLK_r:
                            if (game_mode == IN_GAME) do_reset = true;
                            break;
                        case SDLK_g:
                            draw_ghost = ! draw_ghost;
                            break;
                        case SDLK_p:
                            if (game_mode == IN_GAME) {
                                game_mode = PAUSE;
                                pause_start = cur_timer;
                            } else if (game_mode == PAUSE) {
                                game_mode = IN_GAME;
                                tetris.next_update = cur_timer - pause_start;
                            }
                            break;
                        case SDLK_LEFT:
                            if (game_mode == IN_GAME) key_left(&tetris);
                            break;
                        case SDLK_RIGHT:
                            if (game_mode == IN_GAME) key_right(&tetris);
                            break;
                        case SDLK_UP:
                            if (game_mode == IN_GAME) key_up(&tetris);
                            break;
                        case SDLK_DOWN:
                            if (game_mode == IN_GAME) key_down(&tetris);
                            break;
                        case SDLK_SPACE:
                            if (game_mode == IN_GAME) key_space(&tetris);
                            break;
                        case SDLK_f:
                            SDL_WM_ToggleFullScreen(video);
                            break;
                        default:
                            break;
                    }
                    break;
                case SDL_QUIT:
                    do_quit = 1;
                    break;
                default:
                    break;
            }
        }

        if (do_quit)
            break;

        ticks_now = SDL_GetTicks();
        ticks_diff = ticks_now - ticks_start;
        
        cur_timer = (double)ticks_diff / 1000.0;

        if (game_mode == INTRO && cur_timer >= (intro_start + 5.0))
            do_reset = true;
        
        if (game_mode == GAME_OVER && cur_timer >= (game_over_start + 5.0)) {
            game_mode = INTRO;
            intro_start = cur_timer;
        }

        if (do_reset) {
            game_mode = IN_GAME;
            new_game(&tetris, cur_timer + 1.0);
        }
       
        if (game_mode == IN_GAME) {
            if (! doit(&tetris, cur_timer)) {
                game_mode = GAME_OVER;
                game_over_start = cur_timer;
            }
        }
        
        glMatrixMode(GL_MODELVIEW);
        glLoadIdentity();
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        if (game_mode == IN_GAME || game_mode == PAUSE) {
            draw(&tetris, cur_timer, draw_ghost);
        } else if (game_mode == INTRO) {
            intro(cur_timer - intro_start, cur_timer);
        } else {
            game_over(cur_timer - game_over_start, cur_timer, tetris.score);
        }
        
        SDL_GL_SwapBuffers();
        
        ++framecount;

        if (ticks_now >= (ticks_prev + 1000)) {
            fps = (double)framecount / ((double)(ticks_now - ticks_prev) / 1000.0);
            ticks_prev = ticks_now;
            framecount = 0;

            set_caption(cur_timer, fps);
        }
    }
    
    SDL_Quit();

    return EXIT_SUCCESS;
}

