import React, { Component } from 'react';
import Router, { withRouter } from 'next/router';
import styles from '../styles/Workspace.module.css';
import { rtc } from 'realtime-notebook-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { v4 as uuidv4 } from 'uuid';

class Workspace extends Component {
    constructor(props) {
        super(props);
        if (!Router.query.hub) Router.push('/');
        this.hubName = Router.query.hub.toUpperCase();
        if (!this.hubName) Router.push('/');
        this.fileName = "/home/jupyter/tutorils/test.ipynb"
        this.state = {
            file: {
                cells: [],
            },
        };
        this.numOfCells = 1;
        for (let i = 0; i < this.numOfCells; i++) {
            this.state.file.cells.push({
                source: "",
                metadata: {
                    active: false,
                    hover: false,
                    uid: 'initial-cell',
                }
            });
        }
    }

    componentDidMount() {
        if (this.hubName) {
            this.notebookListener = rtc.hub(this.hubName).interval(500).onNotebookChange(
                this.fileName,
                this.state.file,
                (file) => {
                    let localCells = {};
                    for (let i = 0; i < this.state.file.cells.length; i++) {
                        localCells[this.state.file.cells[i].metadata.uid] = this.state.file.cells[i]
                    }
                    for (let i = 0; i < file.cells.length; i++) {
                        if (localCells.hasOwnProperty(file.cells[i].metadata.uid)) {
                            file.cells[i].metadata.active = localCells[file.cells[i].metadata.uid].metadata.active;
                            file.cells[i].metadata.hover = localCells[file.cells[i].metadata.uid].metadata.hover;
                        }
                    }
                    this.state.file = file;
                    this.setState(this.state);
                });
        }
    }

    componentWillUnmount() {
        if (this.notebookListener) this.notebookListener.unsubscribe();
        rtc.close();
    }

    clickBody(e) {
        e.preventDefault();
        for (let i = 0; i < this.state.file.cells.length; i++) {
            this.state.file.cells[i].metadata.active = false;
        }
        this.setState(this.state);
    }

    hoverBody(e) {
        e.preventDefault();
        for (let i = 0; i < this.state.file.cells.length; i++) {
            this.state.file.cells[i].metadata.hover = false;
        }
        this.setState(this.state);
    }

    textBeforeChange(index, editor, change, value) {
        const from = editor.doc.indexFromPos(change.from);
        const to = editor.doc.indexFromPos(change.to);
        if (from !== to) {
            const removed = this.state.file.cells[index]['source'].substring(from, to);
            this.notebookListener.removeText(index, from, removed);
        }
        if (change.text) {
            const inserted = change.text.join('\n');
            this.notebookListener.insertText(index, from, inserted);
        }
        this.state.file.cells[index]['source'] = value;
        this.setState(this.state);
    }

    clickCell(index, e) {
        e.preventDefault();
        for (let i = 0; i < this.state.file.cells.length; i++) {
            if (i === index) this.state.file.cells[i].metadata.active = true;
            else this.state.file.cells[i].metadata.active = false;
        }
        e.stopPropagation();
        this.setState(this.state);
    }

    hoverCell(index, e) {
        e.preventDefault();
        e.stopPropagation();
        for(let i=0; i<this.state.file.cells.length; i++) {
            if (i === index) this.state.file.cells[i].metadata.hover = true;
            else this.state.file.cells[i].metadata.hover = false;
            this.setState(this.state);
        }
    }

    clickAddCell(index, e) {
        e.preventDefault();
        index++;
        const newCell = {
            source: '',
            metadata: {
                active: false,
                hover: false,
                uid: uuidv4(),
            }
        };
        this.notebookListener.insertCell(index, newCell);
        this.state.file.cells.splice(index, 0, newCell);
        for (let i=0; i<this.state.file.cells.length; i++) {
            if (i === index) this.state.file.cells[i].metadata.active = true;
            else this.state.file.cells[i].metadata.active = false;
        }
        e.stopPropagation();
        this.setState(this.state);
    }

    clickRemoveCell(index, e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.file.cells.length === 1) {
            if (!this.state.file.cells[0].metadata.active) { 
                this.state.file.cells[0].metadata.active = true;
                this.setState(this.state);
            }
            return;
        }
        let oldCell = JSON.parse(JSON.stringify(this.state.file.cells[index]));
        oldCell.metadata.active = false;
        oldCell.metadata.hover = false;
        this.notebookListener.removeCell(index, oldCell);
        this.state.file.cells.splice(index, 1);
        if (index < this.state.file.cells.length && !this.state.file.cells[index].metadata.active)
            this.state.file.cells[index].metadata.hover = true;
        this.setState(this.state);
    }

    generateCells() {
        let cells = [];
        const cellOptions = {
            mode: 'python',
            theme: "dracula",
            lineNumbers: true,
        };
        for (let i = 0; i < this.state.file.cells.length; i++) {
            let source = this.state.file.cells[i]['source'];
            let wrapperClass = styles.cell_wrapper;
            if (this.state.file.cells[i].metadata.active)
                wrapperClass = styles.cell_wrapper_active;
            else if (this.state.file.cells[i].metadata.hover)
                wrapperClass = styles.cell_wrapper_hover;
            const displayBotton = this.state.file.cells[i].metadata.active || this.state.file.cells[i].metadata.hover;
            cells.push(
                <div key={'cell_top'+i} className={styles.cell_top}>
                    {displayBotton &&
                    <div
                        key={'button_box'+i}
                        className={styles.button_box}
                        onMouseOver={this.hoverCell.bind(this, i)}
                    >
                        <div
                            key={'cell_button'+i}
                            className={styles.add_cell_button}
                            onClick={this.clickAddCell.bind(this, i)}
                        >&#43;</div>
                        <div
                            key={'hoz_fillter'+i}
                            className={styles.button_hover_filler_horizontal}
                            onMouseOver={this.hoverCell.bind(this, i)}
                        />
                        <div
                            key={'remove_cell_button'+i}
                            className={styles.remove_cell_button}
                            onClick={this.clickRemoveCell.bind(this, i)}
                            onMouseOver={this.hoverCell.bind(this, i)}
                        >&ndash;</div>
                    </div>}
                    {displayBotton && <div
                        key={'ver_filler'+i}
                        className={styles.button_hover_filler_vertical}
                        onMouseOver={this.hoverCell.bind(this, i)}
                    />}
                    <div
                        key={'cell_wrapper'+i}
                        className={wrapperClass}
                        onClick={this.clickCell.bind(this, i)}
                        onMouseOver={this.hoverCell.bind(this, i)}
                    >
                        <CodeMirror
                            key={'editor'+i}
                            className={styles.text_area}
                            editorDidMount={editor => { editor.setSize(null, 'auto'); }}
                            value={source}
                            options={cellOptions}
                            onBeforeChange={this.textBeforeChange.bind(this, i)}
                        />
                    </div>
                    {displayBotton && <div key={'button_offset'+i} className={styles.button_offset} />}
                </div>
            )
        }
        return cells
    }

    render() {
        return (
            <div
                className={styles.top_wrapper}
                onClick={this.clickBody.bind(this)}
                onMouseOver={this.hoverBody.bind(this)}
            >
                <div className={styles.title}>SYNCPOINT</div>
                {this.generateCells()}
            </div>
        );
    }
}

export default withRouter(Workspace);