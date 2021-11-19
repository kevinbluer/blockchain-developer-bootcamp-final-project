import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './Home.css';
import {Link} from "react-router-dom";


const HomeCards = (props) => {
   
    return (

      <div className="HomeCards">
        <Row xs={3}>
            <Col>
            <Link to="requests">
            <Card
            bg="light"
            border="info"
            text="black"
            >
                <Card.Body>
                <Card.Text as="h5">
                    Request new transactions and updates
                </Card.Text><br/>
                </Card.Body>
                <Button 
                    variant="success"
                >
                   ENTER
                </Button>
             </Card>
             </Link>
            </Col>
            <Col>
            <Link to="approvals">
            <Card
            bg="light"
            border="info"
            text="black"
            >
                <Card.Body>
                <Card.Text as="h5">
                    Approve existing transactions and updates
                </Card.Text><br/>
                </Card.Body>
                <Button 
                    variant="danger"
                >
                   ENTER
                </Button>
             </Card>
             </Link>
            </Col>
            <Col>
            <Link to="information">
            <Card
            bg="light"
            border="info"
            text="black"
            >
                <Card.Body>
                <Card.Text as="h5">
                    Relevant Information
                </Card.Text><br/>
                </Card.Body>
                <Button 
                    variant="warning"
                >
                   ENTER
                </Button>
             </Card>
             </Link>
            </Col>
        </Row>
    </div>
    );
  }
  

export default HomeCards;