from browser import console, document, html, window

style_sheet = """
:root {
    --brython-dialog-font-family: Arial;
    --brython-dialog-font-size: 100%;
    --brython-dialog-bgcolor: #fff;
    --brython-dialog-border-color: #000;
    --brython-dialog-title-bgcolor: CadetBlue;
    --brython-dialog-title-color: #fff;
    --brython-dialog-close-bgcolor: #fff;
    --brython-dialog-close-color: #000;
}

.brython-dialog-main {
    font-family: var(--brython-dialog-font-family);
    font-size: var(--brython-dialog-font-size);
    background-color: var(--brython-dialog-bgcolor);
    left: 10px;
    top: 10px;
    border-style: solid;
    border-color: var(--brython-dialog-border-color);
    border-width: 1px;
    z-index: 10;
    resize: both;
    overflow: auto;
}

.brython-dialog-title {
    background-color: var(--brython-dialog-title-bgcolor);
    color: var(--brython-dialog-title-color);
    border-style: solid;
    border-color: var(--brython-dialog-border-color);
    border-width: 0px 0px 1px 0px;
    padding: 0.4em;
    cursor: default;
}

.brython-dialog-close {
    float: right;
    background-color: var(--brython-dialog-close-bgcolor);
    color: var(--brython-dialog-close-color);
    cursor: default;
    padding: 0.1em;
}

.brython-dialog-panel {
    padding: 0.6em;
}

.brython-dialog-message {
    padding-right: 0.6em;
}

.brython-dialog-button {
    margin: 0.5em;
}

.resizable {

}
"""


class Tk(html.DIV):
    """Basic, moveable dialog box with a title bar, optional
    "Ok" / "Cancel" buttons.
    The "Ok" button is the attribute "ok_button" of the dialog object.
    Supports drag and drop on the document.
    A dialog has an attribute "panel" that can contain elements.
    Method close() removes the dialog box.
    """

    def __init__(self, title="", *,
            top=None, left=None, default_css=True):
        if default_css:
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "brython-dialog":
                    break
            else:
                document <= html.STYLE(style_sheet, id="brython-dialog")

        html.DIV.__init__(self, style='position:absolute;visibility:hidden',
            Class="brython-dialog-main")
        self.title_bar = html.DIV(html.SPAN(title), Class="brython-dialog-title")
        self <= self.title_bar
        self.close_button = html.SPAN("&times;", Class="brython-dialog-close")
        self.title_bar <= self.close_button
        self.close_button.bind("click", self.close)
        self.panel = html.DIV(Class="brython-dialog-panel")
        self.table = html.TABLE(border=1)
        self.panel <= self.table
        self <= self.panel

        document <= self
        cstyle = window.getComputedStyle(self)

        # Center horizontally and vertically
        if left is None:
            width = round(window.innerWidth * 0.1)
            left = int((window.innerWidth - width) / 2)
        self.left = left
        self.style.left = f'{left}px'
        if top is None:
            height = round(float(cstyle.height[:-2]) + 0.5)
            top = int((window.innerHeight - height) / 2)
        # top is relative to document scrollTop
        top += document.scrollingElement.scrollTop
        self.top = top
        self.style.top = f'{top}px'

        self.title_bar.bind("mousedown", self.grab_widget)
        self.bind("leave", self.mouseup)
        self.state = None

    def close(self, *args):
        self.remove()

    def grab_widget(self, event):
        document.bind("mousemove", self.move_widget)
        document.bind("mouseup", self.stop_moving_widget)
        self.initial = [self.left - event.x, self.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def move_widget(self, event):
        # set new moving element coordinates
        self.left = self.initial[0] + event.x
        self.top = self.initial[1] + event.y

    def stop_moving_widget(self, event):
        document.unbind('mousemove')
        document.unbind('mouseup')
        self.state = None

    def mouseup(self, event):
        self.state = None
        document.unbind("mousemove")
        document.unbind("touchmove")

    def mainloop(self):
        self.style.visibility = "visible"

def config(widget, **kw):
      if kw.get('width') is not None:
          widget.style.width = f'{kw["width"]}em'
      if kw.get('height') is not None:
          widget.style.height = f'{kw["height"]}em'
      if kw.get('bg') is not None:
          widget.style.backgroundColor = kw['bg']
      if kw.get('fg') is not None:
          widget.style.color = kw['fg']
      if kw.get('bd') is not None:
          widget.style.borderWidth = kw['db']
          widget.style.borderStyle = 'solid'
          widget.style.borderColor = '#ddd'
      if kw.get('command') is not None:
          widget.bind('click', command)
      if kw.get('state') is not None:
          state = kw['state']
          if state is DISABLED:
              widget.attrs['disabled'] = True
          elif state is NORMAL:
              widget.attrs['disabled'] = False

class Sticky:

    def __init__(self, name):
        self.directions = list(name)

    def __add__(self, other):
        self.mix = [self.directions, other.directions]

E = Sticky('E')
W = Sticky('W')
N = Sticky('N')
S = Sticky('S')
NW = Sticky('NW')
NE = Sticky('NE')
SW = Sticky('SW')
SE = Sticky('SE')

def grid(master, column=0, columnspan=1, row=0, rowspan=1,
        in_=None, ipadx=None, ipady=None,
        sticky=''):
    if not hasattr(master, 'table'):
        master.table = html.TABLE()
        master <= master.table
    if not hasattr(master, 'cells'):
        master.cells = set()
    # The cell at (row, column) in grid must be inserted in table row #row
    # master.cells is a set of (row, column) that are already used because
    # a cell with colspan or rowspan is used

    nb_rows = len(master.table.select('TR'))
    for i in range(row - nb_rows + 1):
        master.table <= html.TR()
    tr = master.table.select('TR')[row]
    # number of TD in table row
    nb_cols = len(tr.select('TD'))
    # cells in row occupied because of rowspan / colspan
    cols_from_span = [c for (r, c) in master.cells
        if r == row and c < column]

    cols_to_add = nb_cols + len(cols_from_span)
    for i in range(column - cols_to_add + 1):
        tr <= html.TD()

    td = tr.select('TD')[column - len(cols_from_span)]

    # update cells
    for i in range(1, rowspan):
        for j in range(columnspan):
            master.cells.add((row + i, column + j))
    for i in range(rowspan):
        for j in range(1, columnspan):
            master.cells.add((row + i, column + j))

    if columnspan > 1:
        td.attrs['colspan'] = columnspan
    if rowspan > 1:
        td.attrs['rowspan'] = rowspan

    if isinstance(sticky, Sticky):
        sticky = sticky.directions
    else:
        sticky = list(sticky)
    if 'W' in sticky:
        td.style.textAlign = 'left'
    if 'E' in sticky:
        td.style.textAlign = 'right'
    if 'N' in sticky:
        td.style.verticalAlign = 'top'
    if 'S' in sticky:
        td.style.verticalAlign = 'bottom'
    return td

class State:

    def __init__(self, value):
        self.value = value

NORMAL = State('NORMAL')
ACTIVE = State('ACTIVE')
DISABLED = State('DISABLED')

class Button:

    def __init__(self, master, text='', **kw):
        self.master = master
        self.kw = kw
        self.widget = html.BUTTON(text)
        config(self.widget, **kw)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        td <= self.widget

class Entry:

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.widget = html.INPUT()

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.widget

class Label:

    def __init__(self, master, text, **kw):
        self.master = master
        self.text = text
        self.kw = kw

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td.text = self.text