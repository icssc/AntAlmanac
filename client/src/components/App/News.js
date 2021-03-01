import React, { PureComponent, Fragment } from 'react';
import { Button, Divider, List, ListItem, Paper, Popover, Tooltip, Typography, withStyles } from '@material-ui/core';
import { RssFeed } from '@material-ui/icons';
import { NEWS_ENDPOINT } from '../../api/endpoints';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment-timezone';

const styles = (theme) => ({
    list: {
        width: theme.spacing(40),
        maxHeight: theme.spacing(40),
        overflow: 'auto',
    },
    listItem: {
        display: 'flex',
        flexDirection: 'column',
    },
    skeleton: {
        padding: '4px',
    },
});

class News extends PureComponent {
    state = {
        anchorEl: null,
        newsItems: null,
        loading: true,
    };

    componentDidMount = async () => {
        try {
            const data = await fetch(NEWS_ENDPOINT);
            const json = await data.json();
            this.setState({ newsItems: json.news, loading: false });
        } catch (e) {
            console.error('Error loading news items:', e);
            this.setState({ newsItems: null, loading: false });
        }
    };

    getNewsItems = () => {
        const { classes } = this.props;
        if (this.state.loading === false && this.state.newsItems !== null) {
            return this.state.newsItems.map((newsItem, index) => {
                return (
                    <Fragment key={newsItem['_id']}>
                        <ListItem alignItems="flex-start" className={classes.listItem} dense>
                            <Typography variant="body1" gutterBottom>
                                {newsItem.title}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                {newsItem.body}
                            </Typography>
                            <Typography variant="caption" gutterBottom color="textSecondary">
                                {moment(newsItem.date).tz('America/Los_Angeles').format('MMMM Do YYYY')}
                            </Typography>
                        </ListItem>
                        {index !== this.state.newsItems.length - 1 ? <Divider /> : null}
                    </Fragment>
                );
            });
        } else if (this.state.loading === false && this.state.newsItems === null) {
            return (
                <ListItem alignItems="flex-start" className={classes.listItem} dense>
                    <Typography variant="caption" gutterBottom>
                        {'Error loading news items'}
                    </Typography>
                </ListItem>
            );
        } else {
            return (
                <div className={this.props.classes.skeleton}>
                    <div>
                        <Skeleton variant="text" animation="wave" height={30} width="50%" />
                    </div>
                    <div>
                        <Skeleton variant="text" animation="wave" />
                    </div>
                    <div>
                        <Skeleton variant="text" animation="wave" width="20%" />
                    </div>
                </div>
            );
        }
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Tooltip title="Toggle news panel">
                    <Button
                        onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
                        color="inherit"
                        startIcon={<RssFeed />}
                    >
                        News
                    </Button>
                </Tooltip>
                <Popover
                    placement="bottom-end"
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
                    onClose={() => this.setState({ anchorEl: null })}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <Paper>
                        <List className={classes.list} disablePadding dense>
                            {this.getNewsItems()}
                        </List>
                    </Paper>
                </Popover>
            </div>
        );
    }
}

export default withStyles(styles)(News);
