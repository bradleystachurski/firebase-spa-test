import React, { Component } from 'react'
import { BrowserRouter, Link, Redirect, Route, Switch } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'
import Home from './Home'
import Login from './Login'
import Register from './Register'
import Dashboard from './protected/Dashboard'
import Admin from './protected/Admin'
import { logout } from '../helpers/auth'
import { firebaseAuth, adminEmail } from '../config/constants'

function PrivateRoute({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{
              pathname: '/login',
              state: {from: props.location}
            }}
          />
      }
    />
  )
}

function PublicRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === false
        ? <Component {...props} />
        : <Redirect to='/dashboard' />
      }
    />
  )
}

export default class App extends Component {
  state = {
    admin: false,
    authed: false,
    loading:  true
  }

  componentDidMount () {
    this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        const admin = user.email === adminEmail
        this.setState({
          admin: admin,
          authed: true,
          loading: false
        })
      } else {
        this.setState({
          admin: false,
          authed: false,
          loading: false
        })
      }
    })
  }

  componentWillUnmount () {
    this.removeListener()
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <nav className="navbar navbar-default navbar-static-top">
            <div className="container">
              <div className="navbar-header">
                <Link to="/" className="navbar-brand">React Router + Firebase Auth</Link>
              </div>
              <ul className="nav navbar-nav pull-right">
                <li>
                  <Link to="/" className="navbar-brand">Home</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="navbar-brand">Dashboard</Link>
                </li>
                <li>
                  {
                    this.state.admin
                      ? <Link to="/admin" className="navbar-brand">Admin</Link>
                      : null
                  }

                </li>
                <li>
                  {
                    this.state.authed
                      ? <button
                          style={{border: 'none', background: 'transparent'}}
                          onClick={() => { logout() }}
                          className="navbar-brand"
                        >
                          Logout
                        </button>
                      : <span>
                          <Link to="/login" className="navbar-brand">Login</Link>
                          <Link to="/register" className="navbar-brand">Register</Link>
                        </span>
                  }
                </li>
              </ul>
            </div>
          </nav>
          <div className="container">
            <div className="row">
              <Switch>
                <Route exact path="/" component={Home} />
                <PublicRoute authed={this.state.authed} path="/login" component={Login}></PublicRoute>
                <PublicRoute authed={this.state.authed} path="/register" component={Register}></PublicRoute>
                <PrivateRoute authed={this.state.authed} path="/dashboard" component={Dashboard}></PrivateRoute>
                <PrivateRoute authed={this.state.authed} path="/admin" component={Admin}></PrivateRoute>
                <Route render={() => <h3>No Match</h3>} />
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    )
  }
}
