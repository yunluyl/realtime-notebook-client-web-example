import React, { Component } from 'react';
import Router, { withRouter } from 'next/router';
import styles from '../styles/Index.module.css';

class IndexPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            workspaceID: '',
            inputPlaceholder: 'Enter Workspace ID',
        }
        document.body.style.backgroundColor = "#262222"
    }

    textChange(e) {
        e.preventDefault();
        this.state.workspaceID = e.target.value.toUpperCase();
        this.setState(this.state);
    }

    clickContinue(e) {
        e.preventDefault();
        if (!this.state.workspaceID) {
            this.state.inputPlaceholder = "Workspace ID cannot be empty";
            this.setState(this.state);
        } else {
            Router.push({
                pathname: '/workspace',
                query: {hub: this.state.workspaceID},
            });
        }
    }

    clickNewID(e) {
        e.preventDefault();
        const cand = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let newWorkspaceID = '';
        for (let i=0; i<6; i++) {
            const idx = Math.floor(Math.random() * Math.floor(26));
            newWorkspaceID += cand.charAt(idx);
        }
        Router.push({
            pathname: '/workspace',
            query: {hub: newWorkspaceID},
        })
    }

    render() {
        return (
            <div className={styles.wrapper}>
                <div className={styles.title}>SYNCPOINT</div>
                <div className={styles.reuse_workspace}>
                <input
                    className={styles.input_box}
                    placeholder={this.state.inputPlaceholder}
                    onChange={this.textChange.bind(this)}
                    value={this.state.workspaceID}
                />
                <div className={styles.continue_button} onClick={this.clickContinue.bind(this)}>&#10132;</div>
                    
                </div>
                <div className={styles.new_button} onClick={this.clickNewID.bind(this)}>Or Create New</div>
            </div>
        );
    }
}

export default withRouter(IndexPage);