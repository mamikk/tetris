
OBJS			= tetris.o

TARGET			= tetris

ifeq ($(PLATFORM),win32)
TARGET			= tetris.exe
endif

CC				= gcc
LD				= gcc

ifeq ($(PLATFORM),win32)
CC				= i586-mingw32msvc-gcc
LD				= i586-mingw32msvc-gcc
endif

CFLAGS			= -Wall -W -Wextra
LDFLAGS			=
CFLAGS			+= --std=gnu99

ifdef RELEASE
CFLAGS			+= -O2 -fomit-frame-pointer
CFLAGS			+= -DNDEBUG
LDFLAGS			+= -s
else
CFLAGS			+= -DDEBUG
CFLAGS			+= -O0 -ggdb
endif

CFLAGS			+= -pipe

LDFLAGS			+= -lm

ifeq ($(PLATFORM),win32)
CFLAGS		+= $(shell ./SDL-1.2.13/bin/sdl-config --cflags)
LDFLAGS		+= $(shell ./SDL-1.2.13/bin/sdl-config --libs)
LDFLAGS		+= -lopengl32 -lglu32
else
CFLAGS		+= $(shell sdl-config --cflags)
LDFLAGS		+= $(shell sdl-config --libs)
LDFLAGS		+= -lGL -lGLU
endif

all: $(TARGET)

$(TARGET): $(OBJS)
	$(LD) -o $@ $^ $(LDFLAGS)

%.o: %.c *.h
	$(CC) -c -o $@ $< $(CFLAGS)

clean:
	rm -f $(TARGET) $(OBJS)

.PHONY: all clean
