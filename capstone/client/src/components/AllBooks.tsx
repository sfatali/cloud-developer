import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { getAllBooks } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface AllBooksState {
  books: Book[]
  loadingBooks: boolean
}

export class AllBooks extends React.PureComponent<BooksProps, AllBooksState> {
  state: AllBooksState = {
    books: [],
    loadingBooks: true
  }

  async componentDidMount() {
    try {
      const books = await getAllBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">All books</Header>

        {this.renderDivider()}

        {this.renderBooks()}
      </div>
    )
  }

  renderDivider() {
    return (
      <Grid padded>
        <Grid.Row>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
        <Grid.Column width={1} floated="right">
            Sold?
        </Grid.Column>
        <Grid.Column width={6} floated="right">
            Book name
        </Grid.Column>
        <Grid.Column width={6} floated="right">
            Author
        </Grid.Column>
        <Grid.Column width={3} floated="right">
            Price
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
      </Grid>
    )
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading all books
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={1} verticalAlign="middle">
                {book.sold? 'Yes' : 'No'}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {book.name}
              </Grid.Column>
              <Grid.Column width={6} floated="right">
                {book.author}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {book.price}
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
