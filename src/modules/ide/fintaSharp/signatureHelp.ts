/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

export const signatureHelp = {
    // signatureHelpTriggerCharacters: ['ABS('],
     provideSignatureHelp: (model, position, token) => {
      let match;
      const textUntilPosition: string = model.getValueInRange({startLineNumber: 1, startColumn: 1,
          endLineNumber: position.lineNumber, endColumn: position.column});
      match = textUntilPosition.match(/MACD\(.*$/);
      if (match) {
       return {
         activeParameter: 0,
         activeSignature: 0,
         signatures: [{
           label: 'indicator MACD(string $value, int $value)',
           parameters: [
             {
               label: 'string $value',
               documentation: 'The input string. Must be one character or longer.'
             },
             {
               label: 'int $valuee',
               documentation: `If $start is non-negative, the returned string will start at the
               $start'th position in string, counting from zero. For instance, in the string 'abcdef', the character at position 0 is
               'a', the character at position 2 is 'c', and so forth.\r\nIf $start is negative, the returned string will start at the $start
               'th character from the end of string. If $string is less than $start characters long, FALSE will be returned.`
             }
           ]
         }]
       };
     }
     match = textUntilPosition.match(/SMA\(.*$/);
     if (match) {
      return {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [{
          label: 'indicator SMA(string $value, int $value)',
          parameters: [
            {
              label: 'string $value',
              documentation: 'The input string. Must be one character or longer.'
            },
            {
              label: 'int $valuee',
              documentation: `If $start is non-negative, the returned string will start at the
              $start'th position in string, counting from zero. For instance, in the string 'abcdef', the character at position 0 is
              'a', the character at position 2 is 'c', and so forth.\r\nIf $start is negative, the returned string will start at the $start
              'th character from the end of string. If $string is less than $start characters long, FALSE will be returned.`
            }
          ]
        }]
      };
    }

       return [];
    }
   };
