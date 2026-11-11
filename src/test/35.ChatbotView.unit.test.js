import * as chai from 'chai';
import { describe, it } from 'mocha';
import { CREATE_CHATBOT_VIEW_SQL } from '../util/chatbotView.js';

const expect = chai.expect;

describe('chatbotData view', () => {
  it('includes product descriptions so Foody can match menu details', () => {
    expect(CREATE_CHATBOT_VIEW_SQL).to.match(/'descripcion'\s*,\s*pr\.descripcion/);
    expect(CREATE_CHATBOT_VIEW_SQL).to.match(/pr\.estado\s*=\s*true/);
  });
});
