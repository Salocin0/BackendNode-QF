import { expect } from 'chai';
import { normalizeRequirementAnswers, encodeRequirementAnswer, decodeRequirementFile } from '../util/requisitosAsociacion.js';
const pdf = { name: 'constancia.pdf', data: 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\nDocumento de prueba').toString('base64') };
describe('Requisitos de asociación y documentos', () => {
  it('preserva los ids cuando las respuestas llegan en otro orden', () => {
    const requirements = [{ id: 4, titulo: 'Experiencia', tipo: 'Cadena de texto' }, { id: 9, titulo: 'Documento', tipo: 'PDF' }];
    const result = normalizeRequirementAnswers(requirements, { primero: { RestriccionId: 9, respuesta: pdf }, segundo: { RestriccionId: 4, respuesta: 'Dos años' } });
    expect(result[0]).to.deep.equal({ restriccionId: 4, respuesta: 'Dos años' });
    expect(decodeRequirementFile(result[1].respuesta).name).to.equal('constancia.pdf');
    expect(Buffer.from(decodeRequirementFile(result[1].respuesta).base64, 'base64').toString()).to.contain('%PDF-1.4');
  });
  it('rechaza requisitos de otro evento, ids repetidos o respuestas vacías', () => {
    const requirements = [{ id: 4, titulo: 'Experiencia', tipo: 'Cadena de texto' }];
    expect(() => normalizeRequirementAnswers(requirements, { a: { RestriccionId: 90, respuesta: 'x' } })).to.throw();
    expect(() => normalizeRequirementAnswers(requirements, { a: { RestriccionId: 4, respuesta: ' ' } })).to.throw();
    expect(() => normalizeRequirementAnswers(requirements, {})).to.throw();
  });
  it('rechaza contenido falso, rutas locales y archivos que superen 5MB', () => {
    const req = { tipo: 'PDF', titulo: 'Documento' };
    expect(() => encodeRequirementAnswer(req, 'C:\\fakepath\\archivo.pdf')).to.throw();
    expect(() => encodeRequirementAnswer(req, { ...pdf, data: 'data:application/pdf;base64,' + Buffer.from('texto sin pdf').toString('base64') })).to.throw();
    expect(() => encodeRequirementAnswer(req, { ...pdf, data: 'data:application/pdf;base64,' + 'A'.repeat(7 * 1024 * 1024) })).to.throw();
  });
  it('valida opciones y conserva cero como respuesta numérica', () => {
    expect(encodeRequirementAnswer({ tipo: 'Numerico' }, '0')).to.equal('0');
    expect(() => encodeRequirementAnswer({ tipo: 'Opciones', opciones: 'Moto,Bici' }, 'Auto')).to.throw();
    expect(encodeRequirementAnswer({ tipo: 'Opciones', opciones: '["Moto","Bici"]' }, 'Moto')).to.equal('Moto');
  });
});
