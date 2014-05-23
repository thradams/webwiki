
function Escape(text)
{
  return text.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



function ReplaceAll(search, replace, str)
{
  search = Escape(search);
  return str.replace(new RegExp(search, 'g'), replace);
};

function ProcessHeaders(lineOfText: string): string
{
  var s = lineOfText.match("^=[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h1>" + text + "</h1>";
  return text;
}

function ProcessHeaders2(lineOfText: string): string
{
  var s = lineOfText.match("^==[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h2>" + text + "</h2>";
  return text;
}

function ProcessHeaders3(lineOfText: string): string
{
  var s = lineOfText.match("^===[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h3>" + text + "</h3>";
  return text;
}

function ProcessHeaders4(lineOfText: string): string
{
  var s = lineOfText.match("^====[^=]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = ReplaceAll("=", "", s[0]);
  text = "<h4>" + text + "</h4>";
  return text;
}


function ReplaceItalic(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("//[^/]+//");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("/", "", sbold[0]);
    sbold2 = "<em>" + sbold2 + "</em>";
    wikiText = ReplaceAll(sbold[0], sbold2, wikiText);
  }
  return wikiText;
}

function ReplaceLinks(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("\\[\\[[^\\|]+\\|[^\\]]+\\]\\]");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("[", "", sbold[0]);
    sbold2 = ReplaceAll("]", "", sbold2);

    var splits = sbold2.split("|");

    var link = "<a href=\"" + splits[0] + "\">" + splits[1] + "</a>";


    wikiText = ReplaceAll(sbold[0], link, wikiText);
  }
  return wikiText;
}

function ReplaceImages(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("\\{\\{[^\\}]+\\}\\}");
    //var sbold = wikiText.match("\\{\\{[a-z.]+\\|[a-z.]+\\}\\}");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("{", "", sbold[0]);
    sbold2 = ReplaceAll("}", "", sbold2);

    //var splits = sbold2.split("|");

    var link = "<img src=\"" + sbold2 + "\"\\>";


    wikiText = ReplaceAll(sbold[0], link, wikiText);
  }
  return wikiText;
}


function ReplaceBolds(wikiText)
{
  while (1)
  {
    var sbold = wikiText.match("[\*][\*][^\*]+[\*][\*]");
    if ((sbold && sbold[0].length == 0) || !sbold)
    {
      break;
    }

    var sbold2 = ReplaceAll("*", "", sbold[0]);
    sbold2 = "<b>" + sbold2 + "</b>";
    wikiText = ReplaceAll(sbold[0], sbold2, wikiText);
  }
  return wikiText;
}

function ReplaceBr(wikiText)
{
  while (1)
  {
    var sbold = wikiText.indexOf("\\\\");
    if (sbold == -1)
      break;


    wikiText = ReplaceAll("\\\\", "<br/>", wikiText);
  }
  return wikiText;
}

function ReplaceInternals(currentLine: string): string
{
  currentLine = ReplaceBolds(currentLine);
  currentLine = ReplaceItalic(currentLine);
  currentLine = ReplaceLinks(currentLine);
  currentLine = ReplaceImages(currentLine);
  currentLine = ReplaceBr(currentLine);
  return currentLine;
}
function ProcessP(lineOfText: string): string
{
  //p poderia ficar por ultimo se nao for outro sera p
  var s = lineOfText.match("[a-zA-Z0-9_]+");
  if ((s && s[0].length == 0) || !s)
    return "";

  lineOfText = ReplaceInternals(lineOfText);

  var text = "<p>" + lineOfText + "</p>";
  return text;
}



function ProcessPageBreak(lineOfText: string): string
{
  var s = lineOfText.indexOf("--pagebreak--");
  if (s != 0)
    return "";
  var text = "<p style=\"page-break-after:always;\"> </p>";
  return text;
}

function ProcessHorizontalLine(lineOfText: string): string
{
  var s = lineOfText.match("----");
  if ((s && s[0].length == 0) || !s)
    return "";

  var text = "<hr>";
  return text;
}


function GeneratePage(wikitext)
{


  var arrayOfLines = wikitext.match(/[^\r\n]+/g);

  var result = "";
  var funcs = [ProcessHeaders,
    ProcessHeaders2,
    ProcessHeaders3,
    ProcessHeaders4,
    ProcessPageBreak,
    ProcessHorizontalLine,
    ProcessP
    ];
  var listIsOpen = false;
  for (var line in arrayOfLines)
  {
    var currentLine: string = arrayOfLines[line];
    if (currentLine.indexOf(" * ") == 0)
    {
      if (!listIsOpen)
      {
        listIsOpen = true;
        result += "<ul>";
      }
      result += "<li>";
      currentLine = currentLine.trim();
      currentLine = currentLine.substr(1, currentLine.length - 1);
      currentLine = ReplaceInternals(currentLine);
      result += currentLine;
      result += "</li>";
    }
    else
    {
      if (listIsOpen)
      {
        result += "</ul>";
        listIsOpen = false;
      }

      for (var i in funcs)
      {
        var s = funcs[i](currentLine);
        if (s)
        {
          result += s;
          break;
        }
      }
    }
  }

  return result;
}

function OnPreview(e)
{

  var el = document.getElementById('content');
  var input = <HTMLInputElement> document.getElementById('wikitext');
  var htmlresult = <HTMLInputElement> document.getElementById('htmlresult');
  var wikitext = input.value;

  var htmlResult = GeneratePage(wikitext);
  el.innerHTML = htmlResult;
  htmlresult.value = htmlResult;

}

function OnPublish(e)
{
  //alert("Vai enviar o txt e html via post para um servidor HTTP");
  var child = document.getElementById("source");
  var parent = child.parentNode;

  parent.removeChild(child);

  window.print();
  
  parent.appendChild(child);
}

function OnWikiChanged(e)
{
  // if (e.keyCode == 13)
  //{
  //OnPreview(e);
  //}
}

function OnShowHide(e)
{
  var el = document.getElementById('wikitext');
  var btn = <HTMLInputElement> document.getElementById('ShowHide');
  if (el.style.display != "none")
  {
    OnPreview(e);
    el.style.display = "none";
    btn.value = "Edit";
  }
  else
  {
    el.style.display = "block";
    btn.value = "See";
  }
}


function OnShowHideResult(e)
{
  var el = document.getElementById('htmlresult');
  var btn = <HTMLInputElement> document.getElementById('ShowHideResult');
  if (el.style.display != "none")
  {
    el.style.display = "none";
    btn.value = "Show";
  }
  else
  {
    el.style.display = "block";
    btn.value = "Hide";
  }

}
function ReadFile()
{
  var file = (<HTMLInputElement>document.getElementById("myfile")).files[0];

  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (e)
  {    
    var input = <HTMLInputElement> document.getElementById('wikitext');
    input.value = e.target.result;
    
    var el = document.getElementById('content');
    var input = <HTMLInputElement> document.getElementById('wikitext');
    var htmlresult = <HTMLInputElement> document.getElementById('htmlresult');
    var wikitext = input.value;

    var htmlResult = GeneratePage(wikitext);
    el.innerHTML = htmlResult;
  }
}

function OnFileSelected(e)
{
  ReadFile();
  //setInterval(ReadFile, 1000);
}

window.onload = () =>
{
};
