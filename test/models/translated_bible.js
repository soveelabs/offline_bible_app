var TranslatedBible = require('../../models/translated_bible'),
app = require('../../server'),
setup = require('../setup');

describe('Translated Bible', function() {
    
    var validTranslatedBibleArgs = {
	bibleId: 'hin-dev',
	version: 'Hindi Developer Version',
	langCode: 'hin',
	sourceBibleId: 'eng-asv',
	status: 'Active',
	url: 'http://foo.xml'
    };

    describe('find one', function() {

	beforeEach(function(done) {
	    var translatedBible = new TranslatedBible(validTranslatedBibleArgs);
	    translatedBible.save(function(err, res) {
		if (err) { return done(err); }
		done();
	    });
	});

	it('finds one matching translated_bible document', function(done) {
	    TranslatedBible.findOne({bibleId: 'hin-dev'}, function(err, res){
		expect(err).to.not.exist;
		expect(res).to.have.property('sourceBibleId', 'eng-asv');
		expect(res).to.have.property('langCode', 'hin');
		expect(res).to.have.property('status', 'Active');
		expect(res).to.have.property('version', 'Hindi Developer Version');
		done();
	    });
	});
	
    });

});
