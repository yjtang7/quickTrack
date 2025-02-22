import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MainListItems from "../Sidebar/listItems";
import Chart from "../Dashboard/Chart";
import Deposits from "../Dashboard/Deposits";
import Orders from "../Dashboard/Orders";
import { UserAuth } from "../../context/AuthContext";
import Plot from "react-plotly.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#3f50b5",
    },
  },
});

function getCash(userId) {
  const db = getDatabase();
  const dbRef = ref(db, `users/${userId}`);

  var records = [];

  onValue(dbRef, (snapshot) => {
    const old_cash = snapshot.val().cash;
    records.push(old_cash);
  });
  return records[0];
}

function getAllStocksCost(userId) {
  const db = getDatabase();
  const dbRef = ref(db, `users/${userId}/stocks`)

  var records = [];
  onValue(dbRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      let keyName = childSnapshot.key;
      let data = childSnapshot.val();
      records.push(data.total_cost);
    });
  });

  let sum = 0;
  for (var i = 0; i < records.length; i++) {
    sum += records[i];
  }
  return sum;
}

function getAllCryptoCost(userId) {
  const db = getDatabase();
  const dbRef = ref(db, `users/${userId}/crypto`);

  var records = [];
  onValue(dbRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      let keyName = childSnapshot.key;
      let data = childSnapshot.val();
      records.push(data.total_cost);
    });
  });

  let sum = 0;
  for (var i = 0; i < records.length; i++) {
    sum += records[i];
  }

  return sum;
}



function DashboardContent() {
  //MAIN CODE HERE
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const { user, logout } = UserAuth();

  const userId = (user.email.split("@")[0] + user.email.split("@")[1]).split(
    "."
  )[0];

  const current_cash = getCash(userId);
  const current_stockValue = getAllStocksCost(userId);
  const current_cryptoValue = getAllCryptoCost(userId);

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open} style={{ background: "#000" }}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Charts
            </Typography>
            {user && user.email}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Chart */}
              <Grid item xs={12} md={8} lg={9}>
                <h4>Risk Allocation Chart</h4>
                  <Plot
                    data={[
                      {
                        values: [current_cash, current_stockValue, current_cryptoValue], // Add in current_stock_value & current_crypto_value
                        labels: ["Cash", "Stock", "Crypto"],
                        type: "pie",
                      },
                    ]}
                    layout={{
                      height: 400,
                      width: 500,
                    }}
                  />
              </Grid>
              {/* Recent Deposits */}
              {/* <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: 240,
                  }}
                >
                  <Deposits />
                </Paper>
              </Grid> */}
              {/* Recent Orders */}
              {/* <Grid item xs={12}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  <Orders />
                </Paper>
              </Grid> */}
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
