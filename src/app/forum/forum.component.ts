import { Component } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

// luo asiakasohjelman amplifyn avulla käyttämällä schema-tyyppiä.
// Kommunikoi AppSyncin kanssa
const client = generateClient<Schema>();

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    NgFor,
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css',
})
export class ForumComponent {
  forumpost: Schema['Forum']['type'][] = []; // alustetaan muuttuja, jonne haetut postaukset ladataan
  inputValue = '';
  userName = localStorage.getItem('fullName');

  constructor() {}

  ngOnInit() {
    this.getPosts();
  }

  // funktio, joka hakee postaukset käyttäen list-metodia. List-metodi palauttaa kaikki kannassa olevat tiedot
  async getPosts() {
    const { data: items } = await client.models.Forum.list();
    this.forumpost = items;
    console.log(items);
  }
  // funktio, joka luo uuden postauksen käyttäen create-metodia
  async newpost() {
    const { data, errors } = await client.models.Forum.create({
      headpost: this.inputValue,
      response: [],
    });

    if (errors) {
      console.error('Virhe luodessa:', errors);
    } else {
      console.log('Luotiin Forum:', data);
    }
    this.inputValue = '';
  }

  async response(forumId: string) {
    // 1. Kysy käyttäjältä vastaus
    const responseValue = window.prompt('Kirjoita uusi vastaus:');

    // 2. Jos käyttäjä painaa "Peruuta" tai syöttää tyhjää, lopeta
    if (!responseValue || responseValue.trim() === '') {
      console.log('Vastausta ei lisätty – syöte oli tyhjä tai peruttu.');
      return;
    }
    // 1. Hae nykyinen Forum-objekti
    const { data: forum, errors: fetchErrors } = await client.models.Forum.get({
      id: forumId,
    });

    if (fetchErrors || !forum) {
      console.error('Forum-objektin haku epäonnistui:', fetchErrors);
      return;
    }

    // 2. Otetaan nykyiset vastaukset ja varmistetaan että se on taulukko
    const currentResponses = Array.isArray(forum.response)
      ? forum.response
      : [];

    await client.models.Forum.update({
      id: forumId,
      response: [...currentResponses, responseValue],
    });
  }

  deleteItem(id: string) {
    client.models.Forum.delete({ id });
  }
}
