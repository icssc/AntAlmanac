import React, { PureComponent, Fragment } from 'react';
import {
    Badge,
    Button,
    Divider,
    List,
    ListItem,
    Paper,
    Popover,
    Tooltip,
    Typography,
    withStyles,
} from '@material-ui/core';
import { RssFeed } from '@material-ui/icons';
import { NEWS_ENDPOINT } from '../../api/endpoints';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment-timezone';
import analyticsEnum, { logAnalytics } from '../../analytics';

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
    dot: {
        right: '5%',
    },
});

class News extends PureComponent {
    _isMounted = false; //necessary to fix a warning. https://stackoverflow.com/a/56537704
    state = {
        anchorEl: null,
        newsItems: null,
        loading: true,
        showDot: false,
    };

    componentDidMount = async () => {
        this._isMounted = true;
        var rawResponse;
        try {
            const data = await fetch(NEWS_ENDPOINT);
            const text = await data.text(); //not doing data.json() so we can debug log the raw response.
            if (!this._isMounted) return; //prevents state update if we've unmounted in the time it took for the request to finish.
            rawResponse = text;
            const json = JSON.parse(text);
            const sortedNewsItems = json.news.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? 1 : 0));

            this.setState({ newsItems: sortedNewsItems, loading: false });

            if (typeof Storage !== 'undefined' && sortedNewsItems.length !== 0) {
                const idOfLatestNewsItem = sortedNewsItems[0]['_id'];
                const idOfLatestCheckedNewsItem = window.localStorage.getItem('idOfLatestCheckedNewsItem');

                if (idOfLatestCheckedNewsItem === null || idOfLatestNewsItem !== idOfLatestCheckedNewsItem)
                    this.setState({ showDot: true });
            }
        } catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error loading news items:', e);
                console.error('Raw news response is:', rawResponse);
            }
            this.setState({ newsItems: null, loading: false });
        }
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    getNewsItems = () => {
        const { classes } = this.props;
        if (this.state.loading === false && this.state.newsItems !== null && this.state.newsItems.length !== 0) {
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
        } else if (this.state.loading === false) {
            return (
                <ListItem alignItems="flex-start" className={classes.listItem} dense>
                    <Typography variant="body2" gutterBottom>
                        No new announcements!
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

    openPopup = (e) => {
        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.CLICK_NEWS,
        });
        this.setState({ anchorEl: e.currentTarget });

        if (typeof Storage !== 'undefined') {
            if (this.state.newsItems && this.state.newsItems.length !== 0) {
                //this check should also fail if length is undefined.
                window.localStorage.setItem('idOfLatestCheckedNewsItem', this.state.newsItems[0]['_id']);
                this.setState({ showDot: false });
            }
        }
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Tooltip title="See latest updates">
                    <Badge
                        variant="dot"
                        overlap="circular"
                        color="error"
                        invisible={!this.state.showDot}
                        classes={{
                            dot: classes.dot,
                        }}
                    >
                        <Button onClick={this.openPopup} color="inherit" startIcon={<RssFeed />}>
                            News
                        </Button>
                    </Badge>
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
